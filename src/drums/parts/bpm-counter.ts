import Bounds from "../../ecs/core/Bounds/Bounds";
import createBundle from "../../ecs/core/Bundle/createBundle";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import { Part } from "../../ecs/core/Part/Part";
import State from "../../ecs/core/State/State";
import Vector from "../../ecs/core/Vector/Vector";
import World from "../../ecs/core/World/World";
import { PrimitiveShape } from "../../ecs/parts/p5/primitive-renderer/components/Primitive";

export type Keypress = {
  key: string;
  time: number;
};

const bpmCounterPart: Part<
  {
    setup: unknown;
    update: unknown;
  },
  {
    bpm: number;
  }
> = ({ registerSystem, triggerBuilder }) => {
  function setupBpmText(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const bpmBundle = createBundle([
      "bpm-text",
      {
        name: "position",
        position: canvasBounds.top.left.plus(Vector.create(10, 30)),
      },
      {
        name: "primitive",
        fill: [240, 60, 100, 255],
        type: "text",
        text: "0",
        align: "left",
        size: 25,
      },
    ]);

    const genreBundle = createBundle([
      "genre-text",
      {
        name: "position",
        position: canvasBounds.top.left.plus(Vector.create(10, 50)),
      },
      {
        name: "primitive",
        fill: [240, 60, 100, 255],
        type: "text",
        text: "0",
        align: "left",
        size: 15,
      },
    ]);

    world.addBundle(bpmBundle);
    world.addBundle(genreBundle);
  }

  function updateBpmText(
    world: World,
    resources: ResourcePool,
    state: { bpm: State<number> },
  ) {
    const [bpmText] = world.query<[PrimitiveShape]>([
      "primitive",
      "bpm-text",
    ])[0];

    if (bpmText.type === "text") {
      // Each press atm triggers two beats atm (all the second beats triggered by a keypress is empty atm)
      bpmText.text = `${Math.round(state.bpm.value).toString()} bpm`;
    }

    const [genreText] = world.query<[PrimitiveShape]>([
      "primitive",
      "genre-text",
    ])[0];

    if (genreText.type === "text") {
      if (state.bpm.value <= 95) {
        genreText.text = "hiphop";
      }

      if (state.bpm.value >= 100) {
        genreText.text = "house";
      }
    }
  }

  registerSystem("bpm-text", triggerBuilder.on("setup"), setupBpmText);
  registerSystem("bpm-counter", triggerBuilder.on("update"), updateBpmText);
};

export default bpmCounterPart;
