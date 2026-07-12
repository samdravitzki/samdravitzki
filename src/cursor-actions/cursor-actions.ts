import p5 from "p5";
import createBundle from "../ecs/core/Bundle/createBundle";
import World from "../ecs/core/World/World";
import Vector from "../ecs/core/Vector/Vector";
import p5Part, { MousePosition } from "../ecs/parts/p5/p5-part";
import collisions from "../ecs/parts/collision/collision";
import Component, { component, tag } from "../ecs/core/Component/Component";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import Position, { PositionData } from "../ecs/components/Position";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Circle, Square } from "../ecs/parts/p5/shape-components";
import { Collider } from "../ecs/parts/collision/components/Collider";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { ClickEventPayload } from "../ecs/parts/p5/p5-system";
import { CollisionEventPayload } from "../ecs/parts/collision/collision-systems";
import Bounds from "../ecs/core/Bounds/Bounds";
import inspector from "../ecs/parts/inspector/inspector";
import Label from "../ecs/core/Component/Label";
import { CollisionContact } from "../ecs/parts/collision/components/Collision";

// Component used to tag entities that should be interactable with the cursor
// Making them easy to query for
const TestShape = tag("test-shape");

const testCircle = [
  TestShape(),
  Circle({
    radius: 75,
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
  Label({
    text: "circle",
  }),
];

const testSquare = [
  TestShape(),
  Square({
    width: 150,
    height: 150,
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
  Label({
    text: "square",
  }),
];

function startingShapes(world: World) {
  world.addBundle(
    createBundle([
      ...testSquare,
      Position({
        position: Vector.create(200, 200),
      }),
    ]),
  );
  world.addBundle(
    createBundle([
      ...testCircle,
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

Position({
  position: Vector.create(0, 0),
});

function setupCursor(world: World) {
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
    Collider({
      type: "aabb",
      layer: "wall",
      width: 10,
      height: 10,
    }),
    Label({
      text: "cursor",
    }),
  ]);

  world.addBundle(cursorCollider);
}

function moveCursor(world: World, resources: ResourcePool) {
  const mousePosition = resources.get<MousePosition>("mouse-position");
  const result = world.query([Position, Cursor])[0];

  if (!result) {
    return;
  }

  const [cursorPosition] = result;

  cursorPosition.componentData.position = Vector.create(
    mousePosition.x,
    mousePosition.y,
  );
}

function cursorClick(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  eventPayload: ClickEventPayload,
) {
  const result = world.query([Circle, Cursor])[0];
  if (!result) {
    return;
  }

  const [circleShape] = result;

  if (eventPayload.type === "press") {
    circleShape.componentData.radius = 10;
  }

  if (eventPayload.type === "release") {
    circleShape.componentData.radius = 5;
  }
}

function cursorGrab(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  eventPayload: ClickEventPayload,
) {
  const collisionContactQuery = world.query([CollisionContact]);

  for (const [contact] of collisionContactQuery) {
    /**
     *
     * Use pattern matching approach to simplify the logic of checking for the correct
     * components in a collision contact. A pattern matching function can define
     * that a collision contact must have a cursor and a shape-style component to be valid
     * for processing declaritively. This reduces the amount of if statements and type checking
     * significantly, and aligns with the apporach used for the query function on World.
     *
     * const matchResult = contact.match(
     *  ["cursor", "position"],
     *  ["shape-style", "position"],
     * )
     *
     * if (!matchResult) {
     *    return;
     * }
     *
     * const [cursorMatch, shapeMatch] = matchResult;
     *
     * or
     *
     *  contact.match(
     *    ["position", "cursor"],
     *    ["position", "shape-style"],
     *    ([cursorPosition], [shapePosition, shapeStyle]) => {
     *      if (eventPayload.type === "press") {
     *        selected.addComponent(grabbedComponent);
     *        selectedShapeStyle.fill = "selected-color";
     *      }
     *
     *      if (eventPayload.type === "release") {
     *          selectedShapeStyle.fill = "hover-color";
     *      }
     *    }
     *  )
     */

    const entityA = world.entity(contact.componentData.entityA);
    const entityB = world.entity(contact.componentData.entityB);

    if (!entityA.hasComponent("cursor") && !entityB.hasComponent("cursor")) {
      continue;
    }

    const selected = !entityA.hasComponent("cursor") ? entityA : entityB;
    const cursor = entityA.hasComponent("cursor") ? entityA : entityB;

    const selectedShapeStyle = selected.getComponent(ShapeStyle);

    const selectedShapePosition = selected.getComponent(Position);

    const cursorPosition = cursor.getComponent(Position);

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
}

function cursorGrabRelease(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  eventPayload: ClickEventPayload,
) {
  if (eventPayload.type === "release") {
    for (const [entityId] of world.query(["entity-id", CursorGrabbed])) {
      world.entity(entityId).removeComponent("cursor:grabbed");
    }
  }
}

function cursorHoverSystem(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  eventPayload: CollisionEventPayload,
) {
  const entityA = world.entity(eventPayload.entityA);
  const entityB = world.entity(eventPayload.entityB);

  if (!entityA.hasComponent("cursor") && !entityB.hasComponent("cursor")) {
    return;
  }

  const collidedEntity = !entityA.hasComponent("cursor") ? entityA : entityB;

  const style = collidedEntity.getComponent(ShapeStyle);

  if (style) {
    if (eventPayload.type === "enter") {
      style.componentData.fill = "#ffffff31";
      collidedEntity.addComponent(CursorHover());
    }

    if (eventPayload.type === "exit") {
      style.componentData.fill = undefined;
      collidedEntity.removeComponent("cursor:hover");
    }
  }
}

function cursorDrag(world: World) {
  const cursorResult = world.query([Position, Cursor])[0];

  for (const [grabbedPosition, grabbed] of world.query([
    Position,
    CursorGrabbed,
  ])) {
    if (cursorResult) {
      const [cursorPosition] = cursorResult;

      grabbedPosition.componentData.position =
        cursorPosition.componentData.position.minus(
          grabbed.componentData.offset,
        );
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

  engine.part(collisions());
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
          ...structuredClone(testCircle),
          Position({
            position: Vector.create(
              Math.random() * canvasBounds.size[0],
              Math.random() * canvasBounds.size[1],
            ),
          }),
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
          ...structuredClone(testSquare),
          Position({
            position: Vector.create(
              Math.random() * canvasBounds.size[0],
              Math.random() * canvasBounds.size[1],
            ),
          }),
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
        const shapes = world.query(["entity-id", TestShape]);

        if (shapes.length === 0) {
          return;
        }

        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        const [entityId] = randomShape;

        world.removeEntity(entityId);
      });
    },
  );

  // Factor out the cursor system into its own part and share with sdf

  engine.system("setup-shapes", engine.trigger.on("setup"), startingShapes);
  engine.system("setup-cursor", engine.trigger.on("setup"), setupCursor);

  engine.system("move-cursor", engine.trigger.on("update"), moveCursor);
  engine.system("cursor-grab", engine.trigger.on("click"), cursorGrab); // cursor system
  engine.system("grab-release", engine.trigger.on("click"), cursorGrabRelease); // cursor system
  engine.system("cursor-click", engine.trigger.on("click"), cursorClick);
  engine.system( // cursor system
    "cursor-hover",
    engine.trigger.on("collision"),
    cursorHoverSystem,
  );
  engine.system("cursor-drag", engine.trigger.on("update"), cursorDrag); // cursor system

  return engine;
}
