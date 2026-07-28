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
  ColliderData,
  CollisionEventPayload,
} from "@dravitzki/dufus-engine/parts/collisions";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import {
  Circle,
  ShapeStyle,
  Square,
  Typography,
  p5Part,
} from "@dravitzki/dufus-engine/parts/p5";

const pallete = {
  background: "#151515",
  secondary: "#252525",
  primary: "#F97316",
};

const movingObjectTag = tag("movingObjectTag");
export const Velocity = component<Vector>({ name: "velocity" });
export const Speed = component<number>({ name: "speed" });

function movingObject(
  position: Vector,
  radius: number,
  colliderType: "aabb" | "circle",
) {
  const shape =
    colliderType === "aabb"
      ? Square({ width: radius, height: radius })
      : Circle({ radius: radius });

  const collider =
    colliderType === "aabb"
      ? Collider({
          type: "aabb",
          width: radius,
          height: radius,
        })
      : Collider({
          type: "circle",
          radius: radius,
        });

  const movingObject = createBundle([
    movingObjectTag(),
    Position({
      position: position,
    }),
    Velocity(Vector.create(0.2, 0.5)),
    Speed(200),
    shape,
    collider,
    ShapeStyle({
      fill: pallete.primary,
    }),
    Label({
      text: "hero-ball",
    }),
  ]);
  return movingObject;
}

function stationaryObject(
  position: Vector,
  radius: number,
  colliderType: "aabb" | "circle",
) {
  const collider =
    colliderType === "aabb"
      ? Collider({
          type: "aabb",
          width: radius,
          height: radius,
        })
      : Collider({
          type: "circle",
          radius: radius,
        });

  return createBundle([
    Position({
      position: position,
    }),
    collider,
    Label({
      text: "box",
    }),
  ]);
}

type ColliderScenario = {
  scenario: string;
  movingObject: ColliderData["type"];
  stationaryObject: "aabb" | "circle";
};

const colliderScenarions: ColliderScenario[] = [
  {
    scenario: "aabb-aabb",
    movingObject: "aabb",
    stationaryObject: "aabb",
  },
  {
    scenario: "circle-circle",
    movingObject: "circle",
    stationaryObject: "circle",
  },
  {
    scenario: "aabb-circle",
    movingObject: "aabb",
    stationaryObject: "circle",
  },
];

export default function collisionDemo3(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event<"fixed-update", { deltaTime: number }>("fixed-update")
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

      let baseOffset = 75;

      for (const scenario of colliderScenarions) {
        const basePosition = canvasBounds.center.top.plus(
          Vector.create(0, baseOffset),
        );
        baseOffset += 150;

        world.addBundle(
          stationaryObject(basePosition, 50, scenario.stationaryObject),
        );

        world.addBundle(movingObject(basePosition, 20, scenario.movingObject));
      }

      world.addBundles(
        boundary(
          canvasBounds.center.center,
          canvasBounds.width,
          canvasBounds.height,
        ),
      );
    },
  );

  let t = 0;

  engine.system(
    "move-balls",
    engine.trigger.on("fixed-update"),
    (world, resources, state, eventEmitter, payload) => {
      for (const [pos, vel, speed] of world.query([
        Position,
        Velocity,
        Speed,
        movingObjectTag,
      ])) {
        const speed = 0.5;
        t += (payload.deltaTime / 1000) * speed;
        pos.componentData.position = pos.componentData.position.plus(
          Vector.create(Math.cos(t) * 2.5, 0),
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
    (world, resources, state, eventEmitter, contact: CollisionEventPayload) => {
      const entityA = world.entity(contact.entityA);
      const entityB = world.entity(contact.entityB);

      const collisionEntities = [entityA, entityB];

      const movingObject = collisionEntities.find((entity) =>
        entity.hasComponent(movingObjectTag),
      );

      const staticObject = collisionEntities.find(
        (entity) => !entity.hasComponent(movingObjectTag),
      );

      const movingObjectPosition =
        movingObject?.getComponent(Position)!.componentData!;

      const staticObjectPosition =
        staticObject?.getComponent(Position)!.componentData!;

      // dot at collision point
      if (contact.type === "enter") {
        world.addBundle(
          createBundle([
            fadedTag(),
            Position({
              position: staticObjectPosition.position.plus(
                contact.contactPoint,
              ),
            }),
            Square({ width: 10, height: 2 }),
            ShapeStyle({
              fill: [0, 100, 100, 255],
            }),
          ]),
        );
      }
      world.addBundle(
        createBundle([
          fadedTag(),
          Position({
            position: movingObjectPosition!.position,
          }),
          Typography({
            align: "center",
            text: contact.type,
            size: 16,
          }),
          ShapeStyle({
            fill: [0, 0, 100, 255],
          }),
          Label({
            text: contact.type,
          }),
        ]),
      );
    },
  );

  return engine;
}
