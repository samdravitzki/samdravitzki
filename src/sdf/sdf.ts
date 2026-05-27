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
import State from "../ecs/core/State/State";
import { SdfShape } from "../ecs/parts/p5/sdf-renderer/sdf-renderer";
import { Collider } from "../ecs/parts/collision/components/Collider";
import collisions, {
  CollisionEventPayload,
} from "../ecs/parts/collision/collision";
import { Collision } from "../ecs/parts/collision/components/Collision";

const baseShapeStyle = [
  {
    name: "shape-style",
    stroke: "#ffffff78",
    strokeWeight: 3,
    dash: [10, 15],
  } satisfies ShapeStyle,
];

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

function sdfShapes(world: World, resources: ResourcePool) {
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

  engine.system(
    "setup-cursor",
    engine.trigger.on("setup"),
    (world, resources) => {
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
    },
  );

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
    },
  );

  engine.system(
    "setup-debug-gui",
    engine.trigger.on("setup"),
    (world, resources, state, emitter) => {
      const p = resources.get<p5>("p5");
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      const debugGui = p.createDiv();
      debugGui.position(0, canvasBounds.max.y + 40, "absolute");
      debugGui.style("width", canvasBounds.width + "px");

      const pane = new Pane({
        container: debugGui.elt,
        title: "Signed distance functions",
      });

      type BindableState = {
        [K in keyof typeof state]: (typeof state)[K] extends State<infer U>
          ? U
          : never;
      };

      const bindableState = Object.fromEntries(
        Object.entries(state).map(([key, state]) => [key, state.value]),
      ) as BindableState;

      const proxiedBindableState = new Proxy(bindableState, {
        set(
          target,
          prop: keyof BindableState,
          value: BindableState[typeof prop],
        ) {
          state[prop].setValue(value);
          target[prop] = value;
          return true;
        },
      });

      pane.addBinding(proxiedBindableState, "sdf-renderer:debug");

      return () => pane.dispose();
    },
  );

  return engine;
}
