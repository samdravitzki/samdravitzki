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
import { MousepressEvent } from "../ecs/parts/p5/p5-system";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import sdfRendererPart from "../ecs/parts/p5/sdf-renderer/sdf-renderer-part";
import { Square } from "../ecs/parts/p5/shape-components";
import { Circle } from "../ecs/parts/p5/shape-components";
import State from "../ecs/core/State/State";
import { SdfShape } from "../ecs/parts/p5/sdf-renderer/sdf-renderer";

const baseShapeComponents = [
  {
    name: "shape-style",
    stroke: "#ffffff78",
    strokeWeight: 3,
    dash: [10, 15],
  } satisfies ShapeStyle,
];

function sdfShapes(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const circle = createBundle([
    {
      name: "position",
      position: canvasBounds.bottom.right.minus(Vector.create(200, 200)),
    } satisfies Position,
    {
      name: "circle",
      radius: 75,
    } satisfies Circle,
    {
      name: "sdf-shape",
      fill: [255, 255, 0],
    } satisfies SdfShape,
    ...baseShapeComponents,
  ]);

  const square = createBundle([
    {
      name: "position",
      position: canvasBounds.top.left.plus(Vector.create(200, 200)),
    } satisfies Position,
    {
      name: "square",
      width: 150,
      height: 150,
    } satisfies Square,
    {
      name: "sdf-shape",
      fill: [255, 255, 255],
    } satisfies SdfShape,
    ...baseShapeComponents,
  ]);

  world.addBundle(circle);
  world.addBundle(square);
}

export default function sdf(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .state("sdf-renderer:debug", false)
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .event<"mousePressed", MousepressEvent>("mousePressed")
    .event<"mouseReleased", MousepressEvent>("mouseReleased")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(sdfRendererPart());

  engine.system("sdf-shapes", engine.trigger.on("setup"), sdfShapes);
  engine.system(
    "create-interactive-shape",
    engine.trigger.on("mousePressed"),
    (world, resources) => {
      const mousePosition = resources.get<MousePosition>("mouse-position");
      const mousePosVector = Vector.create(mousePosition.x, mousePosition.y);
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      if (!canvasBounds.inBounds(mousePosVector)) {
        return;
      }

      const circle = createBundle([
        "interactive-shape",
        {
          name: "position",
          position: mousePosVector,
        } satisfies Position,
        {
          name: "circle",
          radius: 75,
        } satisfies Circle,
        {
          name: "sdf-shape",
          fill: [255, 255, 0],
        } satisfies SdfShape,
        ...baseShapeComponents,
      ]);

      world.addBundle(circle);
    },
  );

  engine.system(
    "move-interactive-shape",
    engine.trigger.on("update"),
    (world, resources) => {
      const mousePosition = resources.get<MousePosition>("mouse-position");
      const interactiveShape = world.query<[Position]>([
        "position",
        "interactive-shape",
      ])[0];

      if (!interactiveShape) {
        return;
      }

      const [position] = interactiveShape;

      position.position = Vector.create(mousePosition.x, mousePosition.y);
    },
  );

  engine.system(
    "remove-interactive-shape",
    engine.trigger.on("mouseReleased"),
    (world) => {
      const interactiveShape = world.query<[EntityId]>([
        "entity-id",
        "interactive-shape",
      ])[0];

      if (interactiveShape) {
        const [entityId] = interactiveShape;
        world.removeEntity(entityId);
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
