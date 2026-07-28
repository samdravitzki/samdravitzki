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
import {
  Circle,
  ShapeStyle,
  Typography,
  p5Part,
} from "@dravitzki/dufus-engine/parts/p5";

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

export default function collisionDemo2(parent?: HTMLElement) {
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
      logging: false,
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

      world.addBundle(
        createBundle([
          Position({
            position: canvasBounds.center.center,
          }),
          Collider({
            type: "aabb",
            width: 100,
            height: 100,
          }),
          Label({
            text: "box",
          }),
        ]),
      );

      world.addBundle(
        ball(canvasBounds.center.left.plus(Vector.create(60, 0)), 20),
      );
    },
  );

  let t = 0;

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
        t += p.deltaTime / 1000;
        pos.componentData.position = pos.componentData.position.plus(
          Vector.create(Math.sin(t) * 3, 0),
        );
      }
    },
  );

  const fadedTag = tag("faded");

  engine.system(
    "text-fade",
    engine.trigger.on("update"),
    (world, resources) => {
      for (const [style, entityId] of world.query([
        ShapeStyle,
        "entity-id",
        fadedTag,
      ])) {
        const p = resources.get<p5>("p5");
        if (style.componentData.fill) {
          const [r, g, b, alpha] = style.componentData.fill as number[];

          const fadeSpeed = 0.3;
          const newAlpha = alpha - p.deltaTime * fadeSpeed;

          if (newAlpha <= 0) {
            world.removeEntity(entityId);
          }

          style.componentData.fill = [r, g, b, newAlpha];
        }
      }
    },
  );

  engine.system(
    "collision-hanlder",
    engine.trigger.on("collision"),
    (world, resources, state, eventEmitter, payload) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      world.addBundle(
        createBundle([
          fadedTag(),
          Position({
            position: canvasBounds.shrink(100).center.top,
          }),
          Typography({
            align: "center",
            text: payload.type,
            size: 24,
          }),
          ShapeStyle({
            fill: [0, 0, 100, 255],
          }),
          Label({
            text: payload.type,
          }),
        ]),
      );
    },
  );

  return engine;
}
