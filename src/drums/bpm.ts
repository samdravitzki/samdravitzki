import createBundle from "../ecs/core/Bundle/createBundle";
import Engine from "../ecs/core/Engine/Engine";
import Vector from "../ecs/core/Vector/Vector";
import { PrimitiveShape } from "../ecs/parts/primitive-renderer/components/Primitive";

export type Keypress = {
  key: string;
  time: number;
};

function bpmPart<T extends { "key-presses": Keypress[] }>(engine: Engine<T>) {
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
   * Given an array of beats work out the bpm they were played at
   * @param beats an array of epoch timestamps relating to when each beat was played
   */
  function deriveBpm(beats: number[]) {
    if (beats.length < 2) {
      return 0;
    }

    const timeDifferences = beats.slice(1).map((num, i) => num - beats[i]);

    const total = timeDifferences.reduce(
      (sum, difference) => sum + difference,
      0
    );
    const msPerBeat = total / timeDifferences.length;
    const bpm = 60_000 / msPerBeat;

    return bpm;
  }

  /**
   * Calculate the bpm as the user taps it out
   *
   * Based on https://www.all8.com/tools/bpm.htm
   */
  engine.system("bpm-counter", { event: "update" }, (world, {}, state) => {
    const keyPresses = state["key-presses"];
    // The difference between each consecutive time
    const bpm = deriveBpm(keyPresses.value.map((press) => press.time));

    const [bpmText] = world.query<[PrimitiveShape]>([
      "primitive",
      "bpm-text",
    ])[0];

    if (bpmText.type === "text") {
      // Each press atm triggers two beats atm (all the second beats triggered by a keypress is empty atm)
      const halfBpm = Math.round(bpm / 2);

      bpmText.text = `${halfBpm.toString()} bpm`;
    }
  });
}

export default bpmPart;
