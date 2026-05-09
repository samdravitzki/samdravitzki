import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import World from "../ecs/core/World/World";
import p5Part from "../ecs/parts/p5/p5-part";
import { PrimitiveShape } from "../ecs/parts/p5/primitive-renderer/components/Primitive";

function templateInfo(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const text = createBundle([
    {
      name: "position",
      position: canvasBounds.center.center,
    } satisfies Position,
    {
      name: "primitive",
      type: "text",
      text: "[template project]",
      fill: "#ffffffde",
      size: 25,
      align: "center",
      font: "Courier New",
    } satisfies PrimitiveShape,
  ]);

  world.addBundle(text);

  const borderInset = 50;

  const border = createBundle([
    {
      name: "position",
      position: canvasBounds.center.center,
    } satisfies Position,
    {
      name: "primitive",
      type: "square",
      stroke: "#ffffff78",
      strokeWeight: 3,
      dash: [10, 10],
      width: canvasBounds.width - borderInset,
      height: canvasBounds.height - borderInset,
      borderRadius: 20,
    } satisfies PrimitiveShape,
  ]);

  world.addBundle(border);
}

export default function projectTemplate(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));

  engine.system("template-info", engine.trigger.on("setup"), templateInfo);

  return engine;
}
