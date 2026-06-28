import p5 from "p5";
import { Pane } from "tweakpane";
import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { EntityId } from "../ecs/core/Entity/Entity";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import p5Part, { KeypressEvent, MousePosition } from "../ecs/parts/p5/p5-part";
import { ClickEventPayload } from "../ecs/parts/p5/p5-system";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import sdfRendererPart from "../ecs/parts/p5/sdf-renderer/sdf-renderer-part";
import { Square } from "../ecs/parts/p5/shape-components";
import { Circle } from "../ecs/parts/p5/shape-components";
import { SdfShape } from "../ecs/parts/p5/sdf-renderer/sdf-renderer";
import { Collider } from "../ecs/parts/collision/components/Collider";
import collisions, {
  CollisionEventPayload,
} from "../ecs/parts/collision/collision";
import stateDebugPaneSystem from "./state-debug-pane";
import { CollisionContact } from "../ecs/parts/collision/components/Collision";

const circle = [
  {
    name: "circle",
    radius: 75,
  } satisfies Circle,
  {
    name: "sdf-shape",
    // fill: [0, 0, 0],
    fill: [255, 255, 0],
  } satisfies SdfShape,
  {
    name: "collider",
    type: "aabb",
    layer: "wall",
    width: 150,
    height: 150,
  } satisfies Collider,
  {
    name: "shape-style",
    stroke: "#ffffff78",
    strokeWeight: 3,
    dash: [10, 15],
  } satisfies ShapeStyle,
];

const square = [
  {
    name: "square",
    width: 150,
    height: 150,
  } satisfies Square,
  {
    name: "sdf-shape",
    // fill: [0, 0, 0],
    fill: [255, 0, 255],
  } satisfies SdfShape,
  {
    name: "collider",
    type: "aabb",
    layer: "wall",
    width: 150,
    height: 150,
  } satisfies Collider,
  {
    name: "shape-style",
    stroke: "#ffffff78",
    strokeWeight: 3,
    dash: [10, 15],
  } satisfies ShapeStyle,
];

function sdfShapes(world: World) {
  world.addBundle(
    createBundle([
      ...square,
      {
        name: "position",
        position: Vector.create(200, 200),
      } satisfies Position,
    ]),
  );
  world.addBundle(
    createBundle([
      ...circle,
      {
        name: "position",
        position: Vector.create(300, 300),
      } satisfies Position,
    ]),
  );
}

export default function sdf(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .state("sdf-renderer:debug", false)
    .state("sdf-renderer:enabled", true)
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .event<"click", ClickEventPayload>("click")
    .event<"click:press", ClickEventPayload>("click:press")
    .event<"click:release", ClickEventPayload>("click:release")
    .event<"collision", CollisionEventPayload>("collision")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14], true));
  engine.part(collisions(false));
  engine.part(sdfRendererPart());

  engine.system("sdf-shapes", engine.trigger.on("setup"), sdfShapes);

  engine.system("setup-toolbar", engine.trigger.on("setup"), () => {
    // create one button for grabbing and dragging, and two others for square and circle creation
    // default to grab and drag, if you click a shape, then place it somewhere it switches to grab and drag mode
  });

  engine.system("setup-cursor", engine.trigger.on("setup"), (world) => {
    const cursorCollider = createBundle([
      "cursor",
      {
        name: "shape-style",
        stroke: "#ffffff",
        strokeWeight: 3,
      } satisfies ShapeStyle,
      {
        name: "position",
        position: Vector.create(0, 0),
      } satisfies Position,
      {
        name: "circle",
        radius: 5,
      } satisfies Circle,
      {
        name: "sdf-shape",
        fill: [255, 255, 255],
      } satisfies SdfShape,
      {
        name: "collider",
        type: "aabb",
        layer: "wall",
        width: 10,
        height: 10,
      } satisfies Collider,
    ]);

    world.addBundle(cursorCollider);
  });

  engine.system(
    "move-cursor",
    engine.trigger.on("update"),
    (world, resources) => {
      const mousePosition = resources.get<MousePosition>("mouse-position");
      const cursor = world.query<[Position]>(["position", "cursor"])[0];

      if (!cursor) {
        return;
      }

      const [position] = cursor;

      position.position = Vector.create(mousePosition.x, mousePosition.y);
    },
  );

  engine.system(
    "cursor-click",
    engine.trigger.on("click"),
    (world, resources, state, eventEmitter, eventPayload) => {
      const cursor = world.query<[Circle]>(["circle", "cursor"])[0];
      if (!cursor) {
        return;
      }

      const [circle] = cursor;

      if (eventPayload.type === "press") {
        circle.radius = 10;
      }

      if (eventPayload.type === "release") {
        circle.radius = 5;
      }
    },
  );

  engine.system(
    "shape-click",
    engine.trigger.on("click"),
    (world, resources, state, eventEmitter, eventPayload) => {
      const collisionContactQuery = world.query<[CollisionContact]>([
        "collision-contact",
      ]);

      for (const [contact] of collisionContactQuery) {
        const entityA = world.entity(contact.entityA);
        const entityB = world.entity(contact.entityB);

        if (
          !entityA.hasComponent("cursor") &&
          !entityB.hasComponent("cursor")
        ) {
          continue;
        }

        const selected = !entityA.hasComponent("cursor") ? entityA : entityB;
        const cursor = entityA.hasComponent("cursor") ? entityA : entityB;

        const cursorPosition = cursor.getComponent("position") as
          | Position
          | undefined;

        const selectedShapeStyle = selected.getComponent("shape-style") as
          | ShapeStyle
          | undefined;

        const selectedShapePosition = selected.getComponent("position") as
          | Position
          | undefined;

        if (!selectedShapeStyle || !selectedShapePosition || !cursorPosition) {
          return;
        }

        if (eventPayload.type === "press") {
          selectedShapeStyle.fill = "#ffffffd0";
          const grabbedComponent = {
            name: "grabbed",
            offset: cursorPosition.position.minus(
              selectedShapePosition.position,
            ),
          };

          selected.addComponent(grabbedComponent); // Just a name component to tag the component as selected
        }

        if (eventPayload.type === "release") {
          selectedShapeStyle.fill = "#ffffff31";
        }
      }
    },
  );

  engine.system("release-grab", engine.trigger.on("click:release"), (world) => {
    for (const [entityId] of world.query<[string]>(["entity-id", "grabbed"])) {
      world.entity(entityId).removeComponent("grabbed");
    }
  });

  engine.system("shape-drag", engine.trigger.on("update"), (world) => {
    const cursor = world.query<[Position]>(["position", "cursor"])[0];

    for (const [entityId, position, grabbed] of world.query<
      [string, Position, any]
    >(["entity-id", "position", "grabbed"])) {
      if (cursor) {
        const [cursorPosition] = cursor;

        position.position = cursorPosition.position.minus(grabbed.offset);
      }
    }
  });

  engine.system(
    "shape-hover",
    engine.trigger.on("collision"),
    (
      world: World,
      resources: ResourcePool,
      state: unknown,
      eventEmitter: unknown,
      eventPayload: CollisionEventPayload,
    ) => {
      if (!world.entity(eventPayload.entityA).hasComponent("cursor")) {
        return;
      }

      const collidedEntity = world.entity(eventPayload.entityB);

      if (collidedEntity.hasComponent("shape-style")) {
        const style = collidedEntity.getComponent("shape-style") as ShapeStyle;
        if (eventPayload.type === "enter") {
          style.fill = "#ffffff31";
        }

        if (eventPayload.type === "exit") {
          style.fill = undefined;
        }
      }
    },
  );

  engine.system(
    "setup-debug-gui",
    engine.trigger.on("setup"),
    stateDebugPaneSystem,
  );

  return engine;
}
