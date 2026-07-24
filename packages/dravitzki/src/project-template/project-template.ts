import {
  dufus,
  World,
  ResourcePool,
  Bounds,
  createBundle,
  Position,
  Label,
} from "@dravitzki/dufus-engine";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import {
  p5Part,
  ShapeStyle,
  Square,
  Typography,
} from "@dravitzki/dufus-engine/parts/p5";

function templateInfo(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const text = createBundle([
    Position({
      position: canvasBounds.center.center,
    }),
    Typography({
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
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(inspector());

  engine.system("template-info", engine.trigger.on("setup"), templateInfo);

  return engine;
}
