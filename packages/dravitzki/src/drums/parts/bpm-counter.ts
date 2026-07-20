import {
  tag,
  World,
  ResourcePool,
  Bounds,
  createBundle,
  Position,
  Vector,
  State,
  Part,
} from "@dravitzki/dufus-engine";
import { ShapeStyle, Text } from "@dravitzki/dufus-engine/parts/p5";

export type Keypress = {
  key: string;
  time: number;
};

export const bpmTextTag = tag("bpm-text");
export const genreTextTag = tag("genre-text");

const bpmCounterPart: Part<
  {
    setup: void;
    update: void;
  },
  {
    bpm: number;
  }
> = ({ registerSystem, triggerBuilder }) => {
  function setupBpmText(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const bpmBundle = createBundle([
      bpmTextTag(),
      Position({
        position: canvasBounds.top.left.plus(Vector.create(10, 30)),
      }),
      Text({
        text: "0",
        align: "left",
        size: 25,
      }),
      ShapeStyle({
        fill: [240, 60, 100, 255],
      }),
    ]);

    const genreBundle = createBundle([
      genreTextTag(),
      Position({
        position: canvasBounds.top.left.plus(Vector.create(10, 50)),
      }),
      Text({
        text: "0",
        align: "left",
        size: 15,
      }),
      ShapeStyle({
        fill: [240, 60, 100, 255],
      }),
    ]);

    world.addBundle(bpmBundle);
    world.addBundle(genreBundle);
  }

  function updateBpmText(
    world: World,
    resources: ResourcePool,
    state: { bpm: State<number> },
  ) {
    const [bpmText] = world.query([Text, bpmTextTag])[0];

    // Each press atm triggers two beats atm (all the second beats triggered by a keypress is empty atm)
    bpmText.componentData.text = `${Math.round(state.bpm.value).toString()} bpm`;

    const [genreText] = world.query([Text, genreTextTag])[0];

    if (state.bpm.value <= 95) {
      genreText.componentData.text = "hiphop";
    }

    if (state.bpm.value >= 100) {
      genreText.componentData.text = "house";
    }
  }

  registerSystem("bpm-text", triggerBuilder.on("setup"), setupBpmText);
  registerSystem("bpm-counter", triggerBuilder.on("update"), updateBpmText);
};

export default bpmCounterPart;
