import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import p5Part from "../ecs/parts/p5/p5-part";
import {
  Circle,
  PrimitiveShape,
  ShapeStyle,
  Square,
} from "../ecs/parts/p5/primitive-renderer/components/Primitive";

function templateInfo(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const style = {
    name: "shape-style",
    stroke: "#ffffff78",
    strokeWeight: 3,
  } satisfies ShapeStyle;

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
    style,
  ]);

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
  ]);

  world.addBundle(square);
  world.addBundle(circle);
}

export default function sdf(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));

  engine.system("template-info", engine.trigger.on("setup"), templateInfo);

  return engine;
}
