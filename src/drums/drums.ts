import * as Tone from "tone";
import { EngineBuilder } from "../ecs/core/Engine/Engine";
import createBundle from "../ecs/core/Bundle/createBundle";
import Vector from "../ecs/core/Vector/Vector";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";
import Bounds from "../ecs/core/Bounds/Bounds";
import poissonDisc from "../lib/poisson-disc/poisson-disc";
import randomInt from "../lib/randomInt/randomInt";

const drums = EngineBuilder.create().build();

drums.part(primitiveRenderer);

const sampler = new Tone.Sampler({
  urls: {
    ["C2"]: "public/hs_clap.wav",
  },
}).toDestination();

drums.system("drum", { event: "keypress" }, (_world, { p }) => {
  sampler.triggerAttackRelease("C2", "1n");
});

const bounds = Bounds.create(Vector.create(0, 0), Vector.create(500, 500));

const dots = poissonDisc(bounds);

drums.system(
  "visulisation",
  { event: "keypress" },
  (world, { canvasBounds }) => {
    const position = Vector.create(
      randomInt(canvasBounds.max.x - canvasBounds.min.x),
      randomInt(canvasBounds.max.y - canvasBounds.min.y)
    );

    const clapEmoji = createBundle([
      {
        name: "position",
        position,
      },
      {
        name: "primitive",
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: [240, 60, 100],
        type: "text",
        text: "👏",
        align: "left",
        size: 25,
      },
    ]);

    world.addBundle(clapEmoji);
  }
);

export default drums;
