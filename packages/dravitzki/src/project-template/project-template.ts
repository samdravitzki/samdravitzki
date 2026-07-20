import Position from "@dravitzki/dufus-engine/src/components/Position";
import Bounds from "@dravitzki/dufus-engine/src/core/Bounds/Bounds";
import createBundle from "@dravitzki/dufus-engine/src/core/Bundle/createBundle";
import Label from "@dravitzki/dufus-engine/src/core/Component/Label";
import { EngineBuilder } from "@dravitzki/dufus-engine/src/core/Engine/EngineBuilder";
import { ResourcePool } from "@dravitzki/dufus-engine/src/core/Engine/ResourcePool";
import World from "@dravitzki/dufus-engine/src/core/World/World";
import inspector from "@dravitzki/dufus-engine/src/parts/inspector/inspector";
import p5Part from "@dravitzki/dufus-engine/src/parts/p5/p5-part";
import { ShapeStyle } from "@dravitzki/dufus-engine/src/parts/p5/primitive-renderer/ShapeStyle";
import { Text } from "@dravitzki/dufus-engine/src/parts/p5/shape-components";
import { Square } from "@dravitzki/dufus-engine/src/parts/p5/shape-components";

function templateInfo(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const text = createBundle([
    Position({
      position: canvasBounds.center.center,
    }),
    Text({
      text: "[template project]",
      size: 25,
      align: "center",
      font: "Courier New",
    }),
    ShapeStyle({
      fill: "#ffffffde",
    }),
    Label({
      text: "title",
    }),
  ]);

  world.addBundle(text);

  const borderInset = 50;

  const border = createBundle([
    Position({
      position: canvasBounds.center.center,
    }),
    Square({
      width: canvasBounds.width - borderInset,
      height: canvasBounds.height - borderInset,
      borderRadius: 20,
    }),
    ShapeStyle({
      stroke: "#ffffff78",
      strokeWeight: 3,
      dash: [10, 10],
      dashOffset: 0,
    }),
    Label({
      text: "border",
    }),
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
  engine.part(inspector());

  engine.system("template-info", engine.trigger.on("setup"), templateInfo);

  return engine;
}
