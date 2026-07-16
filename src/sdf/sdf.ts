import Position from "../ecs/components/Position";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
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
import { component, tag } from "../ecs/core/Component/Component";
import inspector from "../ecs/parts/inspector/inspector";

const circle = [
  Circle({
    radius: 75,
  }),
  SdfShape({
    fill: [255, 255, 0],
  }),
  Collider({
    type: "aabb",
    layer: "wall",
    width: 150,
    height: 150,
  }),
  ShapeStyle({
    stroke: "#ffffff78",
    strokeWeight: 3,
    dash: [10, 15],
  }),
];

const square = [
  Square({
    width: 150,
    height: 150,
  }),
  SdfShape({
    fill: [255, 0, 255],
  }),
  Collider({
    type: "aabb",
    layer: "wall",
    width: 150,
    height: 150,
  }),
  ShapeStyle({
    stroke: "#ffffff78",
    strokeWeight: 3,
    dash: [10, 15],
  }),
];

function sdfShapes(world: World) {
  world.addBundle(
    createBundle([
      ...square,
      Position({
        position: Vector.create(200, 200),
      }),
    ]),
  );
  world.addBundle(
    createBundle([
      ...circle,
      Position({
        position: Vector.create(300, 300),
      }),
    ]),
  );
}

// Cursor components
const Cursor = tag("cursor");
type CursorGrabbedData = {
  offset: Vector;
};

const CursorGrabbed = component<CursorGrabbedData>({ name: "cursor:grabbed" });

const CursorHover = tag("cursor:hover");

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
  engine.part(collisions());
  engine.part(sdfRendererPart());
  engine.part(inspector());

  engine.system("sdf-shapes", engine.trigger.on("setup"), sdfShapes);

  engine.system("setup-toolbar", engine.trigger.on("setup"), () => {
    // create one button for grabbing and dragging, and two others for square and circle creation
    // default to grab and drag, if you click a shape, then place it somewhere it switches to grab and drag mode
  });

  engine.system("setup-cursor", engine.trigger.on("setup"), (world) => {
    const cursorCollider = createBundle([
      Cursor(),
      ShapeStyle({
        stroke: "#ffffff",
        strokeWeight: 3,
      }),
      Position({
        position: Vector.create(0, 0),
      }),
      Circle({
        radius: 5,
      }),
      SdfShape({
        fill: [255, 255, 255],
      }),
      Collider({
        type: "aabb",
        layer: "wall",
        width: 10,
        height: 10,
      }),
    ]);

    world.addBundle(cursorCollider);
  });

  engine.system(
    "move-cursor",
    engine.trigger.on("update"),
    (world, resources) => {
      const mousePosition = resources.get<MousePosition>("mouse-position");
      const cursor = world.query([Position, "cursor"])[0];

      if (!cursor) {
        return;
      }

      const [position] = cursor;

      position.componentData.position = Vector.create(
        mousePosition.x,
        mousePosition.y,
      );
    },
  );

  engine.system(
    "cursor-click",
    engine.trigger.on("click"),
    (world, resources, state, eventEmitter, eventPayload) => {
      const cursor = world.query([Circle, "cursor"])[0];
      if (!cursor) {
        return;
      }

      const [circle] = cursor;

      if (eventPayload.type === "press") {
        circle.componentData.radius = 10;
      }

      if (eventPayload.type === "release") {
        circle.componentData.radius = 5;
      }
    },
  );

  engine.system(
    "shape-click",
    engine.trigger.on("click"),
    (world, resources, state, eventEmitter, eventPayload) => {
      const collisionContactQuery = world.query([CollisionContact]);

      for (const [contact] of collisionContactQuery) {
        const entityA = world.entity(contact.componentData.entityA);
        const entityB = world.entity(contact.componentData.entityB);

        if (
          !entityA.hasComponent("cursor") &&
          !entityB.hasComponent("cursor")
        ) {
          continue;
        }

        const selected = !entityA.hasComponent("cursor") ? entityA : entityB;
        const cursor = entityA.hasComponent("cursor") ? entityA : entityB;

        const cursorPosition = cursor.getComponent(Position);

        const selectedShapeStyle = selected.getComponent(ShapeStyle);

        const selectedShapePosition = selected.getComponent(Position);

        if (!selectedShapeStyle || !selectedShapePosition || !cursorPosition) {
          return;
        }

        if (eventPayload.type === "press") {
          selectedShapeStyle.componentData.fill = "#ffffffd0";
          const grabbedComponent = CursorGrabbed({
            offset: cursorPosition.componentData.position.minus(
              selectedShapePosition.componentData.position,
            ),
          });

          selected.addComponent(grabbedComponent); // Just a name component to tag the component as selected
        }

        if (eventPayload.type === "release") {
          selectedShapeStyle.componentData.fill = "#ffffff31";
        }
      }
    },
  );

  engine.system("release-grab", engine.trigger.on("click:release"), (world) => {
    for (const [entityId] of world.query(["entity-id", CursorGrabbed])) {
      world.entity(entityId).removeComponent(CursorGrabbed.componentName);
    }
  });

  engine.system("shape-drag", engine.trigger.on("update"), (world) => {
    const cursor = world.query([Position, "cursor"])[0];

    for (const [entityId, position, grabbed] of world.query([
      "entity-id",
      Position,
      CursorGrabbed,
    ])) {
      if (cursor) {
        const [cursorPosition] = cursor;

        position.componentData.position =
          cursorPosition.componentData.position.minus(
            grabbed.componentData.offset,
          );
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

      const style = collidedEntity.getComponent(ShapeStyle);
      if (style) {
        if (eventPayload.type === "enter") {
          style.componentData.fill = "#ffffff31";
        }

        if (eventPayload.type === "exit") {
          style.componentData.fill = undefined;
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
