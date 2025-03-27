import createBundle from "../ecs/core/Bundle/createBundle";
import Engine from "../ecs/core/Engine/Engine";
import Vector from "../ecs/core/Vector/Vector";
import { PrimitiveShape } from "../ecs/parts/primitive-renderer/components/Primitive";

export type Keypress = {
  key: string;
  time: number;
};

function bpmCounterPart<T extends { bpm: number }>(engine: Engine<T>) {
  engine.system("bpm-text", { event: "start" }, (world, { canvasBounds }) => {
    const textBundle = createBundle([
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

    world.addBundle(textBundle);
  });
  /**
   * Calculate the bpm as the user taps it out
   *
   * Based on https://www.all8.com/tools/bpm.htm
   */
  engine.system("bpm-counter", { event: "update" }, (world, {}, state) => {
    const [bpmText] = world.query<[PrimitiveShape]>([
      "primitive",
      "bpm-text",
    ])[0];

    if (bpmText.type === "text") {
      // Each press atm triggers two beats atm (all the second beats triggered by a keypress is empty atm)
      const halfBpm = Math.round(state.bpm.value);

      bpmText.text = `${halfBpm.toString()} bpm`;
    }
  });
}

export default bpmCounterPart;
