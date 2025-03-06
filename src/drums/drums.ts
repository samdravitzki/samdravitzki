import * as Tone from "tone";
import { EngineBuilder } from "../ecs/core/Engine/Engine";
import createBundle from "../ecs/core/Bundle/createBundle";
import Vector from "../ecs/core/Vector/Vector";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";
import randomInt from "../lib/randomInt/randomInt";
import { PrimitiveShape } from "../ecs/parts/primitive-renderer/components/Primitive";
import Component from "../ecs/core/Component/Component";
import Bounds from "../ecs/core/Bounds/Bounds";

const drums = EngineBuilder.create().state("sequence-index", 0).build();

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
const sequences = [ // edited
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 0, 1]
];

const kickSequence = sequences[0];

const clap = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_clap.wav",
  },
}).toDestination();

const clapSequence = sequences[1];

const hat = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_hat.wav",
  },
}).toDestination();

const hatSequence = sequences[2];

const openHat = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_ohat.wav",
  },
}).toDestination();

const openHatSequence = sequences[3];

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
  (world, { canvasBounds }, state) => {
    const sequenceIndex = state["sequence-index"].value;

    const time = Tone.now();

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

    console.log(nextIndex);
    state["sequence-index"].setValue(nextIndex);
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
