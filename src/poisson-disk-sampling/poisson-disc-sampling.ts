import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/Engine";
import Vector from "../ecs/core/Vector/Vector";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";
import poissonDisc from "./poissonDisc/poissonDisc";
import randomDots from "./randomDots/randomDots";

const engine = EngineBuilder.create()
  .state("dotCount", 100)
  .build(document.getElementById("poisson-disc-sampling-sketch")!);

engine.part(primitiveRenderer);

engine.system(
  "place-random-dots",
  { event: "start" },
  (world, { canvasBounds }, { dotCount }) => {
    const dots = randomDots(dotCount.value, canvasBounds);

    for (const dot of dots) {
      world.addBundle(
        createBundle([
          {
            name: "primitive",
            stroke: [240, 60, 70],
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

engine.system(
  "place-poisson-dots",
  { event: "start" },
  (world, { canvasBounds }, { dotCount }) => {
    const bounds = Bounds.create(
      Vector.create(canvasBounds.min.x, canvasBounds.min.y),
      Vector.create(canvasBounds.max.x, canvasBounds.max.y)
    );

    console.log(bounds);

    const dots = poissonDisc(bounds);

    const dotWidth = 5;

    for (const dot of dots) {
      world.addBundle(
        createBundle([
          {
            name: "primitive",
            stroke: [345, 80, 100],
            strokeWeight: 2,
            fill: false,
            type: "circle",
            radius: dotWidth,
          },
          {
            name: "position",
            position: dot.plus(Vector.create(dotWidth, dotWidth)),
          },
        ])
      );
    }
  }
);

engine.run();
