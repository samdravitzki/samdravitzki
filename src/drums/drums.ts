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
  .state<"active-sequence", string | null>("active-sequence", null)
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
const houseSequences = [
  [1, 0, 1, 0, 1, 0, 1, 0], // kick
  [0, 0, 1, 0, 0, 0, 1, 0], // clap
  [1, 0, 1, 0, 1, 0, 1, 0], // hat
  [0, 1, 0, 1, 0, 1, 0, 1], // open hat
  [0, 0, 0, 0, 0, 0, 0, 0], // snare
];

// prettier-ignore
const hiphopSequences = [
  [0, 1, 0, 0, 0, 1, 0, 0], // kick
  [0, 0, 0, 0, 0, 0, 0, 0], // clap
  [1, 1, 1, 1, 1, 1, 1, 1], // hat
  [0, 0, 0, 0, 0, 0, 0, 0], // open hat
  [0, 0, 1, 0, 0, 0, 1, 0], // snare
];

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
  // This snare is very quiet
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_snare.wav",
  },
}).chain(
  new Tone.Filter(15000, "lowpass"),
  new Tone.Filter(0, "highpass"),
  new Tone.Compressor({
    threshold: 0,
    ratio: 1,
    attack: 0.5,
    release: 1,
  }),
  Tone.getDestination()
);

Tone.getTransport().start();
/**
 * Based on the pattern of keypresses entered by the user
 * determine the sequence that should start playing
 */
drums.system(
  "pattern-detector",
  { event: "keypress" },
  (_world, { p }, state) => {
    const keyPresses = state["key-presses"].value;
    const activeSequence = state["active-sequence"];
    const sequenceIndex = state["sequence-index"];

    keyPresses.push(p.key);

    if (keyPresses.length >= 4) {
      const [d, c, b, a] = keyPresses.slice(-4);

      let patternDectected: string | null = null;

      // AABB pattern
      if (
        (a === b && b !== c && c === d && d !== a) ||
        (a !== b && b === c && c !== d && d === a)
      ) {
        patternDectected = "hiphop";
      }

      // ABAB pattern
      if (a !== b && a === c && b === d && b !== c && d !== a) {
        patternDectected = "house";
      }

      // when pattern changes or is null
      if (
        activeSequence.value !== patternDectected ||
        patternDectected === null
      ) {
        sequenceIndex.setValue(0);
        console.debug("reset sequence");
      }

      console.debug(`${patternDectected} pattern detected`);
      activeSequence.setValue(patternDectected);
    }

    // only keep sliding window of 4 most recent key presses
    const recentPresses = keyPresses.slice(-4);
    console.debug(recentPresses);
    state["key-presses"].setValue(recentPresses);
  }
);

/**
 * On keypress increment through 8 note sequence
 */
drums.system(
  "sequence-incrementer",
  { event: "keypress" },
  (_world, {}, state) => {
    const sequenceIndex = state["sequence-index"];
    const nextIndex = (sequenceIndex.value + 1) % 8;
    sequenceIndex.setValue(nextIndex);
  }
);

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

/**
 * Play drum sounds based on engine state
 */
drums.system(
  "drum",
  { event: "keypress" },
  (world, { canvasBounds }, state) => {
    const sequenceIndex = state["sequence-index"];
    const activeSequence = state["active-sequence"];
    // TODO: need a way to gaurantee the order of systems executed so that we can assume the keypress state defined by the "pattern-detector" system is set before this runs so that there isn't stuff delayed to the next keypress
    const time = Tone.now();

    const sequencesToPlay =
      activeSequence.value === "house" ? houseSequences : hiphopSequences;

    const kickSequence = sequencesToPlay[0];
    const clapSequence = sequencesToPlay[1];
    const hatSequence = sequencesToPlay[2];
    const openHatSequence = sequencesToPlay[3];
    const snareSequence = sequencesToPlay[4];

    const textEffectBounds = canvasBounds.shrink(100);

    if (activeSequence.value === null) {
      kick.triggerAttackRelease("C2", "1n", time);
      world.addBundle(randomlyPositionedTextBundle("kick", textEffectBounds));
    } else {
      if (clapSequence[sequenceIndex.value] === 1) {
        clap.triggerAttackRelease("C2", "1n", time);
        world.addBundle(randomlyPositionedTextBundle("clap", textEffectBounds));
      }

      if (kickSequence[sequenceIndex.value] === 1) {
        kick.triggerAttackRelease("C2", "1n", time);
        world.addBundle(randomlyPositionedTextBundle("kick", textEffectBounds));
      }

      if (hatSequence[sequenceIndex.value] === 1) {
        hat.triggerAttackRelease("C2", "1n", time);
        world.addBundle(randomlyPositionedTextBundle("hat", textEffectBounds));
      }

      if (openHatSequence[sequenceIndex.value] === 1) {
        openHat.triggerAttackRelease("C2", "1n", time);
        world.addBundle(
          randomlyPositionedTextBundle("open hat", textEffectBounds)
        );
      }

      if (snareSequence[sequenceIndex.value] === 1) {
        snare.triggerAttackRelease("C2", "1n", time);
        world.addBundle(
          randomlyPositionedTextBundle("snare", textEffectBounds)
        );
      }
    }
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
