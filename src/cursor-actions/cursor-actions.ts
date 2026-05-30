import { Position } from "../ecs/components/Position";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import World from "../ecs/core/World/World";
import Vector from "../ecs/core/Vector/Vector";
import p5Part, { MousePosition } from "../ecs/parts/p5/p5-part";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../ecs/parts/p5/shape-components";
import { Circle } from "../ecs/parts/p5/shape-components";
import { Collider } from "../ecs/parts/collision/components/Collider";
import { SdfShape } from "../ecs/parts/p5/sdf-renderer/sdf-renderer";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { ClickEventPayload } from "../ecs/parts/p5/p5-system";
import { Collision } from "../ecs/parts/collision/components/Collision";
import { CollisionEventPayload } from "../ecs/parts/collision/collision-systems";
import collisions from "../ecs/parts/collision/collision";

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
      name: "grabbed",
      offset: position.position.minus(selectedShapePosition.position),
    };

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
    for (const [entityId] of world.query<[string]>(["entity-id", "grabbed"])) {
      world.entity(entityId).removeComponent("grabbed");
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
    }

    if (eventPayload.type === "exit") {
      style.fill = undefined;
    }
  }
}

function cursorDrag(world: World) {
  const cursor = world.query<[Position]>(["position", "cursor"])[0];

  for (const [entityId, position, grabbed] of world.query<
    [string, Position, any]
  >(["entity-id", "position", "grabbed"])) {
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
