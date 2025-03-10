import * as Tone from "tone";
import { EngineBuilder } from "../ecs/core/Engine/Engine";
import createBundle from "../ecs/core/Bundle/createBundle";
import Vector from "../ecs/core/Vector/Vector";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";
import randomInt from "../lib/randomInt/randomInt";
import { PrimitiveShape } from "../ecs/parts/primitive-renderer/components/Primitive";
import Component from "../ecs/core/Component/Component";
import Bounds from "../ecs/core/Bounds/Bounds";

const drums = EngineBuilder.create()
  .state("sequence-index", 0)
  .state<"key-presses", string[]>("key-presses", [])
  .build();

/**
 * Used Drumhaus (https://github.com/mxfng/drumhaus/tree/main) an in browser
 * drum machine based on tonejs alot as a reference for this
 */

drums.part(primitiveRenderer);

const kick = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_kick.wav",
  },
}).toDestination();

// prettier-ignore
// const houseSequences = [ // house
//   [1, 0, 1, 0, 1, 0, 1, 0], // kick
//   [0, 0, 1, 0, 0, 0, 1, 0], // clap
//   [1, 0, 1, 0, 1, 0, 1, 0], // hat
//   [0, 1, 0, 1, 0, 1, 0, 1], // open hat
//   [0, 0, 0, 0, 0, 0, 0, 0], // snare
// ];

// prettier-ignore
const houseSequences = [ // hiphop
  [1, 0, 0, 0, 0, 1, 0, 0], // kick
  [0, 0, 0, 0, 0, 0, 0, 0], // clap
  [1, 1, 1, 1, 1, 1, 1, 1], // hat
  [0, 0, 0, 0, 0, 0, 0, 0], // open hat
  [0, 0, 1, 1, 0, 0, 1, 0], // snare
];

const kickSequence = houseSequences[0];
const clapSequence = houseSequences[1];
const hatSequence = houseSequences[2];
const openHatSequence = houseSequences[3];
const snareSequence = houseSequences[4];

const clap = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_clap.wav",
  },
}).toDestination();

const hat = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_hat.wav",
  },
}).toDestination();

const openHat = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_ohat.wav",
  },
}).toDestination();

const snare = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_snare.wav",
  },
}).toDestination();

Tone.getTransport().start();

function randomlyPositionedTextBundle(text: string, canvasBounds: Bounds) {
  const position = Vector.create(
    randomInt(canvasBounds.max.x - canvasBounds.min.x) + canvasBounds.min.x,
    randomInt(canvasBounds.max.y - canvasBounds.min.y) + canvasBounds.min.y
  );

  const textBundle = createBundle([
    "text",
    {
      name: "position",
      position,
    },
    {
      name: "primitive",
      fill: [240, 60, 100, 255],
      type: "text",
      text: text,
      align: "left",
      size: 25,
    },
  ]);

  return textBundle;
}

drums.system(
  "drum",
  { event: "keypress" },
  (world, { canvasBounds, p }, state) => {
    const sequenceIndex = state["sequence-index"].value;
    const keyPresses = state["key-presses"].value;
    keyPresses.push(p.key);

    const time = Tone.now();

    /**
     * Play through a house beat sequence when the user is tapping alternating keys otherwise
     * play a kick sound
     *
     * Want to extend this so that based on repeating pattern of keys pressed a different beats to
     * see if it is any fun
     *
     * Had to write this comment as this really the easiest to understand from the code
     */

    const textEffectBounds = canvasBounds.shrink(100);

    const currentPress = keyPresses[keyPresses.length - 1];
    const lastPress = keyPresses[keyPresses.length - 2];

    if (keyPresses.length <= 2 || currentPress === lastPress) {
      kick.triggerAttackRelease("C2", "1n", time);
      const kickTextEffect = randomlyPositionedTextBundle(
        "kick",
        textEffectBounds
      );
      world.addBundle(kickTextEffect);
      state["sequence-index"].setValue(0);
    } else if (currentPress !== lastPress) {
      if (clapSequence[sequenceIndex] === 1) {
        clap.triggerAttackRelease("C2", "1n", time);
        const clapTextEffect = randomlyPositionedTextBundle(
          "clap",
          textEffectBounds
        );
        world.addBundle(clapTextEffect);
      }

      if (kickSequence[sequenceIndex] === 1) {
        kick.triggerAttackRelease("C2", "1n", time);
        const kickTextEffect = randomlyPositionedTextBundle(
          "kick",
          textEffectBounds
        );
        world.addBundle(kickTextEffect);
      }

      if (hatSequence[sequenceIndex] === 1) {
        hat.triggerAttackRelease("C2", "1n", time);
        const hatTextEffect = randomlyPositionedTextBundle(
          "hat",
          textEffectBounds
        );
        world.addBundle(hatTextEffect);
      }

      if (openHatSequence[sequenceIndex] === 1) {
        openHat.triggerAttackRelease("C2", "1n", time);
        const openHatTextEffect = randomlyPositionedTextBundle(
          "open hat",
          textEffectBounds
        );
        world.addBundle(openHatTextEffect);
      }

      if (snareSequence[sequenceIndex] === 1) {
        snare.triggerAttackRelease("C2", "1n", time);
        const snareTextEffect = randomlyPositionedTextBundle(
          "snare",
          textEffectBounds
        );
        world.addBundle(snareTextEffect);
      }

      const nextIndex = (sequenceIndex + 1) % 8;
      state["sequence-index"].setValue(nextIndex);
    }

    const recentPresses = keyPresses.slice(Math.max(keyPresses.length - 3, 0));
    state["key-presses"].setValue(recentPresses);
  }
);

export type TextEffectComponent = Component & {
  name: "text";
};

/**
 * Fade out any text effect entities over time and when they are no
 * longer visible remove them
 */
drums.system("text-fade", { event: "update" }, (world, { p }) => {
  for (const [primitive, entityId] of world.query<
    [PrimitiveShape, string, TextEffectComponent]
  >(["primitive", "entity-id", "text"])) {
    if (primitive.fill) {
      const [r, g, b, alpha] = primitive.fill;

      const fadeSpeed = 0.4;
      const newAlpha = alpha - p.deltaTime * fadeSpeed;

      if (newAlpha <= 0) {
        world.removeEntity(entityId);
      }

      primitive.fill = [r, g, b, newAlpha];
    }
  }
});

export default drums;
