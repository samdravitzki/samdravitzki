import p5 from "p5";
import createBundle from "../ecs/core/Bundle/createBundle";
import World from "../ecs/core/World/World";
import Vector from "../ecs/core/Vector/Vector";
import p5Part, { MousePosition } from "../ecs/parts/p5/p5-part";
import collisions from "../ecs/parts/collision/collision";
import Component from "../ecs/core/Component/Component";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { Position } from "../ecs/components/Position";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../ecs/parts/p5/shape-components";
import { Circle } from "../ecs/parts/p5/shape-components";
import { Collider } from "../ecs/parts/collision/components/Collider";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { ClickEventPayload } from "../ecs/parts/p5/p5-system";
import { Collision } from "../ecs/parts/collision/components/Collision";
import { CollisionEventPayload } from "../ecs/parts/collision/collision-systems";
import Bounds from "../ecs/core/Bounds/Bounds";
import Label from "../ecs/core/Component/Label";
import inspector from "../ecs/parts/inspector/inspector";

// Component used to tag entities that should be interactable with the cursor
// Making them easy to query for
type TestShapeComponent = Component & {
  name: "test-shape";
};

const testShape = {
  name: "test-shape",
} satisfies TestShapeComponent;

const circle = [
  testShape,
  {
    name: "circle",
    radius: 75,
  } satisfies Circle,
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
  {
    name: "label",
    text: "circle",
  } satisfies Label,
];

const square = [
  testShape,
  {
    name: "square",
    width: 150,
    height: 150,
  } satisfies Square,
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
  {
    name: "label",
    text: "square",
  } satisfies Label,
];

function setupShapes(world: World) {
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

// Cursor components
type Cursor = Component & {
  name: "cursor";
};

type CursorGrabbed = Component & {
  name: "cursor:grabbed";
  offset: Vector;
};

type CursorHover = Component & {
  name: "cursor:hover";
};

function setupCursor(world: World) {
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
      name: "collider",
      type: "aabb",
      layer: "wall",
      width: 10,
      height: 10,
    } satisfies Collider,
    {
      name: "label",
      text: "cursor",
    } satisfies Label,
  ]);

  world.addBundle(cursorCollider);
}
function moveCursor(world: World, resources: ResourcePool) {
  const mousePosition = resources.get<MousePosition>("mouse-position");
  const cursor = world.query<[Position]>(["position", "cursor"])[0];

  if (!cursor) {
    return;
  }

  const [position] = cursor;

  position.position = Vector.create(mousePosition.x, mousePosition.y);
}

function cursorClick(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  eventPayload: ClickEventPayload,
) {
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
}

function cursorGrab(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  eventPayload: ClickEventPayload,
) {
  const cursor = world.query<[Collision, Position]>([
    "collision",
    "position",
    "cursor",
  ])[0];

  if (!cursor) {
    return;
  }

  const [collision, position] = cursor;

  const selected = world.entity(collision.entityId);
  const selectedShapeStyle = selected.getComponent("shape-style") as
    | ShapeStyle
    | undefined;

  const selectedShapePosition = selected.getComponent("position") as
    | Position
    | undefined;

  if (!selectedShapeStyle || !selectedShapePosition) {
    return;
  }

  if (eventPayload.type === "press") {
    selectedShapeStyle.fill = "#ffffffd0";
    const grabbedComponent = {
      name: "cursor:grabbed",
      offset: position.position.minus(selectedShapePosition.position),
    } satisfies CursorGrabbed;

    selected.addComponent(grabbedComponent); // Just a name component to tag the component as selected
  }

  if (eventPayload.type === "release") {
    selectedShapeStyle.fill = "#ffffff31";
  }
}

function cursorGrabRelease(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  eventPayload: ClickEventPayload,
) {
  if (eventPayload.type === "release") {
    for (const [entityId] of world.query<[string]>([
      "entity-id",
      "cursor:grabbed",
    ])) {
      world.entity(entityId).removeComponent("cursor:grabbed");
    }
  }
}

function cursorHover(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  eventPayload: CollisionEventPayload,
) {
  if (!world.entity(eventPayload.collidingEntity).hasComponent("cursor")) {
    return;
  }

  const collidedEntity = world.entity(eventPayload.collidedEntity);

  if (collidedEntity.hasComponent("shape-style")) {
    const style = collidedEntity.getComponent("shape-style") as ShapeStyle;
    if (eventPayload.type === "enter") {
      style.fill = "#ffffff31";
      collidedEntity.addComponent({
        name: "cursor:hover",
      } satisfies CursorHover);
    }

    if (eventPayload.type === "exit") {
      style.fill = undefined;
      collidedEntity.removeComponent("cursor:hover");
    }
  }
}

function cursorDrag(world: World) {
  const cursor = world.query<[Position]>(["position", "cursor"])[0];

  for (const [position, grabbed] of world.query<[Position, CursorGrabbed]>([
    "position",
    "cursor:grabbed",
  ])) {
    if (cursor) {
      const [cursorPosition] = cursor;

      position.position = cursorPosition.position.minus(grabbed.offset);
    }
  }
}

export default function cursorActions(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"click", ClickEventPayload>("click")
    .event<"collision", CollisionEventPayload>("collision")
    .build();

  engine.part(collisions(false));
  engine.part(p5Part([500, 500], parent, [0, 0, 14], true));
  engine.part(inspector());

  engine.system(
    "add-shape-button",
    engine.trigger.on("setup"),
    (world, resources) => {
      const p = resources.get<p5>("p5");
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      function styleButton(button: p5.Element) {
        button.style("padding", "4px 8px");
        button.style("font-size", "0.8em");
        button.style("background-color", "#28292e");
        button.style("color", "#fff");
        button.style("border", "1px solid #ffffff31");
        button.style("border-radius", "4px");
        button.style("width", "150px");
      }

      const addCircleButton = p.createButton("Add Circle");
      addCircleButton.position(
        canvasBounds.top.right.x,
        canvasBounds.top.right.y + 30,
      );

      styleButton(addCircleButton);

      addCircleButton.mousePressed(() => {
        const newCircle = createBundle([
          ...structuredClone(circle),
          {
            name: "position",
            position: Vector.create(
              Math.random() * canvasBounds.size[0],
              Math.random() * canvasBounds.size[1],
            ),
          } satisfies Position,
        ]);

        world.addBundle(newCircle);
      });

      const addSquareButton = p.createButton("Add Square");
      addSquareButton.position(
        canvasBounds.top.right.x,
        canvasBounds.top.right.y + 60,
      );

      styleButton(addSquareButton);
      addSquareButton.style("width", "150px");

      addSquareButton.mousePressed(() => {
        const newSquare = createBundle([
          ...structuredClone(square),
          {
            name: "position",
            position: Vector.create(
              Math.random() * canvasBounds.size[0],
              Math.random() * canvasBounds.size[1],
            ),
          } satisfies Position,
        ]);

        world.addBundle(newSquare);
      });

      const removeRandom = p.createButton("Remove Random");

      styleButton(removeRandom);

      removeRandom.position(
        canvasBounds.top.right.x,
        canvasBounds.top.right.y + 90,
      );

      removeRandom.mousePressed(() => {
        const shapes = world.query<["entity-id", TestShapeComponent]>([
          "entity-id",
          "test-shape",
        ]);

        if (shapes.length === 0) {
          return;
        }

        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        const [entityId] = randomShape;

        world.removeEntity(entityId);
      });
    },
  );

  engine.system("setup-shapes", engine.trigger.on("setup"), setupShapes);
  engine.system("setup-cursor", engine.trigger.on("setup"), setupCursor);

  engine.system("move-cursor", engine.trigger.on("update"), moveCursor);
  engine.system("cursor-grab", engine.trigger.on("click"), cursorGrab);
  engine.system("grab-release", engine.trigger.on("click"), cursorGrabRelease);
  engine.system("cursor-click", engine.trigger.on("click"), cursorClick);
  engine.system("cursor-hover", engine.trigger.on("collision"), cursorHover);
  engine.system("cursor-drag", engine.trigger.on("update"), cursorDrag);

  return engine;
}
