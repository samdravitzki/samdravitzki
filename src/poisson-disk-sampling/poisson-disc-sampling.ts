import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import Vector from "../ecs/core/Vector/Vector";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";
import poissonDisc from "../lib/poisson-disc/poisson-disc";
import randomDots from "./random-dots/random-dots";

const poissonDiscSamplingDemo = EngineBuilder.create()
  .state("dotCount", 100)
  .build();

poissonDiscSamplingDemo.part(primitiveRenderer);

poissonDiscSamplingDemo.system(
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

poissonDiscSamplingDemo.system(
  "place-poisson-dots",
  { event: "start" },
  (world, { canvasBounds }, { dotCount }) => {
    const bounds = Bounds.create(
      Vector.create(canvasBounds.min.x, canvasBounds.min.y),
      Vector.create(canvasBounds.max.x, canvasBounds.max.y)
    );

    const dots = poissonDisc(bounds);

    const dotWidth = 2;

    for (const dot of dots) {
      world.addBundle(
        createBundle([
          {
            name: "primitive",
            stroke: [345, 80, 100],
            strokeWeight: 2,
            fill: [345, 80, 100],
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

export default poissonDiscSamplingDemo;
