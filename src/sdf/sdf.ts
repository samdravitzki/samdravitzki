import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import p5Part, { KeypressEvent, MousePosition } from "../ecs/parts/p5/p5-part";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../ecs/parts/p5/shape-components";
import { Circle } from "../ecs/parts/p5/shape-components";

function sdfShapes(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const style = {
    name: "shape-style",
    stroke: "#ffffff78",
    strokeWeight: 3,
    dash: [10, 15],
  } satisfies ShapeStyle;

  const sdfShapeComponent = "sdf-shape";
  const circle = createBundle([
    {
      name: "position",
      position: canvasBounds.bottom.right.minus(Vector.create(200, 200)),
    } satisfies Position,
    {
      name: "circle",
      radius: 75,
    } satisfies Circle,
    style,
    sdfShapeComponent,
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
      ...style,
      dashOffset: 5,
    },
    sdfShapeComponent,
  ]);

  world.addBundle(circle);
  world.addBundle(square);
}

export default function sdf(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .event("keypress")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));

  engine.system("sdf-shapes", engine.trigger.on("setup"), sdfShapes);
  engine.system(
    "move-circle",
    engine.trigger.on("keyPressed"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");
      const mousePosition = resources.get<MousePosition>("mouse-position");
      const style = {
        name: "shape-style",
        stroke: "#ffffff78",
        strokeWeight: 3,
        dash: [10, 15],
      } satisfies ShapeStyle;

      const sdfShapeComponent = "sdf-shape";
      const circle = createBundle([
        {
          name: "position",
          position: Vector.create(mousePosition.x, mousePosition.y),
        } satisfies Position,
        {
          name: "circle",
          radius: 75,
        } satisfies Circle,
        style,
        sdfShapeComponent,
      ]);

      world.addBundle(circle);
    },
  );

  return engine;
}
