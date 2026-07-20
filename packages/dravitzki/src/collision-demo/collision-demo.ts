import Bounds from "@dravitzki/dufus-engine/src/core/Bounds/Bounds";
import { EngineBuilder } from "@dravitzki/dufus-engine/src/core/Engine/EngineBuilder";
import { ResourcePool } from "@dravitzki/dufus-engine/src/core/Engine/ResourcePool";
import World from "@dravitzki/dufus-engine/src/core/World/World";
import inspector from "@dravitzki/dufus-engine/src/parts/inspector/inspector";
import p5Part from "@dravitzki/dufus-engine/src/parts/p5/p5-part";
import boundary from "./prefabs/boundary";
import collision, {
  CollisionEventPayload,
} from "@dravitzki/dufus-engine/src/parts/collision/collision";
import Vector from "@dravitzki/dufus-engine/src/core/Vector/Vector";
import Position from "@dravitzki/dufus-engine/src/components/Position";
import createBundle from "@dravitzki/dufus-engine/src/core/Bundle/createBundle";
import { Circle } from "@dravitzki/dufus-engine/src/parts/p5/shape-components";
import { ShapeStyle } from "@dravitzki/dufus-engine/src/parts/p5/primitive-renderer/ShapeStyle";
import Label from "@dravitzki/dufus-engine/src/core/Component/Label";
import { Collider } from "@dravitzki/dufus-engine/src/parts/collision/components/Collider";
import {
  component,
  tag,
} from "@dravitzki/dufus-engine/src/core/Component/Component";

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
    Speed(5),
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
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"collision", CollisionEventPayload>("collision")
    .build();

  engine.part(p5Part([500, 500], parent, pallete.background));
  engine.part(inspector());
  engine.part(
    collision({
      visualiseColliders: true,
      logging: true,
    }),
  );

  engine.system(
    "setup-world",
    engine.trigger.on("setup"),
    (world: World, resources: ResourcePool) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      world.addBundle(
        boundary(
          canvasBounds.center.center,
          canvasBounds.width,
          canvasBounds.height,
        ),
      );

      world.addBundle(ball(canvasBounds.center.center, 20));
    },
  );
  const GRAVITY = new Vector(0, 0.1);

  // The order of the gravity, bounce balls and move balls systems is important. Need to find a way to gaurantee this
  // with the engine. The bounce balls system triggering on the collision event makes this difficult.

  engine.system("gravity", engine.trigger.on("update"), (world) => {
    for (const [vel] of world.query([Velocity, Position, Speed, ballTag])) {
      vel.componentData = vel.componentData.plus(GRAVITY);
    }
  });

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

  engine.system("move-balls", engine.trigger.on("update"), (world) => {
    for (const [pos, vel, speed] of world.query([
      Position,
      Velocity,
      Speed,
      ballTag,
    ])) {
      pos.componentData.position = pos.componentData.position.plus(
        vel.componentData.times(speed.componentData),
      );
    }
  });

  return engine;
}
