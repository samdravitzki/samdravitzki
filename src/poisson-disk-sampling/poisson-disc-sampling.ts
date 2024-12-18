import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/Engine";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";
import randomDots from "./randomDots/randomDots";

const engine = EngineBuilder.create()
  .state("dotCount", 100)
  .build(document.getElementById("poisson-disc-sampling-sketch")!);

engine.part(primitiveRenderer);

engine.system(
  "place-dots",
  { event: "start" },
  (world, { canvasBounds }, { dotCount }) => {
    const dots = randomDots(dotCount.value, canvasBounds);

    for (const dot of dots) {
      world.addBundle(
        createBundle([
          {
            name: "primitive",
            stroke: [240, 60, 100],
            strokeWeight: 2,
            fill: false,
            type: "circle",
            radius: 5,
          },
          {
            name: "position",
            position: dot,
          },
        ])
      );
    }
  }
);

engine.run();
