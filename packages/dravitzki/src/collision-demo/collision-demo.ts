import p5 from "p5";
import {
  dufus,
  World,
  ResourcePool,
  component,
  tag,
  Label,
  Bounds,
  Vector,
  Position,
  createBundle,
} from "@dravitzki/dufus-engine";

import boundary from "./prefabs/boundary";
import {
  collisions,
  Collider,
  CollisionEventPayload,
} from "@dravitzki/dufus-engine/parts/collisions";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import { Circle, ShapeStyle, p5Part } from "@dravitzki/dufus-engine/parts/p5";

const pallete = {
  background: "#151515",
  secondary: "#252525",
  primary: "#F97316",
};

const ballTag = tag("ball");
export const Velocity = component<Vector>({ name: "velocity" });
export const Speed = component<number>({ name: "speed" });

function ball(position: Vector, radius: number) {
  const ball = createBundle([
    ballTag(),
    Position({
      position: position,
    }),
    Velocity(Vector.create(0.2, 0.5)),
    Speed(200),
    Circle({
      radius: radius,
    }),
    Collider({
      type: "aabb",
      width: radius * 2,
      height: radius * 2,
    }),
    ShapeStyle({
      fill: pallete.primary,
    }),
    Label({
      text: "hero-ball",
    }),
  ]);
  return ball;
}

export default function collisionDemo(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"collision", CollisionEventPayload>("collision")
    .build();

  engine.part(p5Part([500, 500], parent, pallete.background));
  engine.part(inspector());

  engine.part(
    collisions({
      visualiseColliders: true,
      logging: true,
    }),
  );

  engine.system(
    "setup-world",
    engine.trigger.on("setup"),
    (world: World, resources: ResourcePool) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      world.addBundles(
        boundary(
          canvasBounds.center.center,
          canvasBounds.width,
          canvasBounds.height,
        ),
      );

      world.addBundle(ball(canvasBounds.center.center, 20));
    },
  );
  const GRAVITY = new Vector(0, 9.8);

  // The order of the gravity, bounce balls and move balls systems is important. Need to find a way to gaurantee this
  // with the engine. The bounce balls system triggering on the collision event makes this difficult.

  engine.system("gravity", engine.trigger.on("update"), (world, resources) => {
    const p = resources.get<p5>("p5");
    for (const [vel] of world.query([Velocity, Position, Speed, ballTag])) {
      const gravity = GRAVITY.times(p.deltaTime / 1000);

      vel.componentData = vel.componentData.plus(gravity);
    }
  });

  engine.system(
    "move-balls",
    engine.trigger.on("update"),
    (world, resources) => {
      const p = resources.get<p5>("p5");
      for (const [pos, vel, speed] of world.query([
        Position,
        Velocity,
        Speed,
        ballTag,
      ])) {
        pos.componentData.position = pos.componentData.position.plus(
          vel.componentData
            .times(speed.componentData)
            .times(p.deltaTime / 1000),
        );
      }
    },
  );

  engine.system(
    "bounce-balls",
    engine.trigger.on("collision"),
    (world, resources, state, emitter, contact) => {
      if (contact.type !== "enter") {
        return;
      }

      const entityA = world.entity(contact.entityA);
      const entityB = world.entity(contact.entityB);

      const collisionEntities = [entityA, entityB];

      const ballEntity = collisionEntities.find((entity) =>
        entity.hasComponent(ballTag),
      );

      // Exit if the it isn't a collision between a ball and something else
      if (!ballEntity) {
        return;
      }

      // Depenetrate ball from the other entity (required to stop decay of velocity and keep it infinitly bouncing)
      // Without depenetration gravity accumulates on the collision frame and the ball eventually stops bouncing
      const ballPosition = ballEntity.getComponent(Position)!;
      ballPosition.componentData.position =
        ballPosition.componentData.position.plus(
          contact.normal.times(contact.penetration),
        );

      // Reflect velocity
      const ballVelocity = ballEntity.getComponent(Velocity)!;

      ballVelocity.componentData = ballVelocity.componentData.reflect(
        contact.normal.normalised(),
      );
    },
  );

  return engine;
}
