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
// const sequences = [ // raw
//   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
//   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
//   [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
//   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
// ];

// prettier-ignore
const houseSequences = [ // edited
  [1, 0, 1, 0, 1, 0, 1, 0], // kick
  [0, 0, 1, 0, 0, 0, 1, 0], // clap
  [1, 0, 1, 0, 1, 0, 1, 0], // hat
  [0, 1, 0, 1, 0, 1, 0, 1], // open hat
];

const kickSequence = houseSequences[0];
const clapSequence = houseSequences[1];
const hatSequence = houseSequences[2];
const openHatSequence = houseSequences[3];

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

Tone.getTransport().start();

function randomlyPositionedTextBundle(emoji: string, canvasBounds: Bounds) {
  const position = Vector.create(
    randomInt(canvasBounds.max.x - canvasBounds.min.x),
    randomInt(canvasBounds.max.y - canvasBounds.min.y)
  );

  const emojiBundle = createBundle([
    "emoji",
    {
      name: "position",
      position,
    },
    {
      name: "primitive",
      fill: [240, 60, 100, 255],
      type: "text",
      text: emoji,
      align: "left",
      size: 25,
    },
  ]);

  return emojiBundle;
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

    const currentPress = keyPresses[keyPresses.length - 1];
    const lastPress = keyPresses[keyPresses.length - 2];

    if (keyPresses.length <= 2 || currentPress === lastPress) {
      kick.triggerAttackRelease("C2", "1n", time);
      const kickEmoji = randomlyPositionedTextBundle("kick", canvasBounds);
      world.addBundle(kickEmoji);
      state["sequence-index"].setValue(0);
    } else if (currentPress !== lastPress) {
      if (clapSequence[sequenceIndex] === 1) {
        clap.triggerAttackRelease("C2", "1n", time);
        const clapEmoji = randomlyPositionedTextBundle("clap", canvasBounds);
        world.addBundle(clapEmoji);
      }

      if (kickSequence[sequenceIndex] === 1) {
        kick.triggerAttackRelease("C2", "1n", time);
        const kickEmoji = randomlyPositionedTextBundle("kick", canvasBounds);
        world.addBundle(kickEmoji);
      }

      if (hatSequence[sequenceIndex] === 1) {
        hat.triggerAttackRelease("C2", "1n", time);
        const hatEmoji = randomlyPositionedTextBundle("hat", canvasBounds);
        world.addBundle(hatEmoji);
      }

      if (openHatSequence[sequenceIndex] === 1) {
        openHat.triggerAttackRelease("C2", "1n", time);
        const openHatEmoji = randomlyPositionedTextBundle(
          "open hat",
          canvasBounds
        );
        world.addBundle(openHatEmoji);
      }

      const nextIndex = (sequenceIndex + 1) % 8;
      state["sequence-index"].setValue(nextIndex);
    }

    const recentPresses = keyPresses.slice(Math.max(keyPresses.length - 3, 0));
    state["key-presses"].setValue(recentPresses);
  }
);

export type EmojiComponent = Component & {
  name: "emoji";
};

/**
 * Fade out any emoji entities over time and when they are no
 * longer visible remove them
 */
drums.system("emoji-fade", { event: "update" }, (world, { p }) => {
  for (const [primitive, entityId] of world.query<
    [PrimitiveShape, string, EmojiComponent]
  >(["primitive", "entity-id", "emoji"])) {
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
