import * as Tone from "tone";
import { EngineBuilder } from "../ecs/core/Engine/Engine";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";
import { PrimitiveShape } from "../ecs/parts/primitive-renderer/components/Primitive";
import Component from "../ecs/core/Component/Component";
import bpmCounterPart, { Keypress } from "./bpm-counter";
import hiphopTab from "./tabs/hiphop";
import houseTab from "./tabs/house";
import { lofiHipHopDrumkit } from "./drumkits/lofi-hiphop";
import { parisHouseDrumkit } from "./drumkits/paris-house";
import { createRandomlyPositionedTextBundle } from "./createRandomlyPositionedTextBundle";
import { deriveBpm } from "./deriveBpm";

const drums = EngineBuilder.create()
  .state("sequence-index", 0)
  .state<"key-presses", Keypress[]>("key-presses", [])
  .state("bpm", 0)
  .build();

/**
 * The idea is to make a game that makes the user feel like they're playing
 * the drums.
 *
 * How do we do this?:
 * The approach I want to take is by the user entering a repeated pattern of
 * key presses different beats will play and if every pattern has an assoicated
 * beat they will very easily be able to play something that sounds good. I like
 * this approach because it adds an element of discovery where the player can
 * find different beats by trying patterns. Gaining skill with the tool is done
 * by mastering these patterns to play the sounds you want to hear on demand.
 *
 * The element of discovery:
 * I think we can also develop the element of discovery further by adding other instruments
 * into the background if the beat is played at a consistent tempo and could change
 * other variables depending on where the pattern is played on the keyboard or what
 * keys are in the pattern.
 *
 * Visualisation:
 * Not sure yet how to go about this but I want the visuals to reinforce to the user
 * that when they are playing a pattern that they should keep repeating it and to communicate
 * to the user when they have changed the pattern. I also like the idea of it mimicing the
 * design of a drum machine. I also think its important to communicate to the user what
 * loop they are playing, this should have the name of the loop but more importantly something
 * visual to represent the loop
 *
 * Used Drumhaus (https://github.com/mxfng/drumhaus/tree/main) an in browser
 * drum machine based on tonejs alot as a reference for this
 */

drums.part(primitiveRenderer);

drums.system("calculate-bpm", { event: "keypress" }, (_world, {}, state) => {
  const keyPresses = state["key-presses"];
  // The difference between each consecutive time
  const bpm = deriveBpm(keyPresses.value.map((press) => press.time));
  // I remove every odd beat in a tab to remove any rests and so have doubled the bpm to account for this
  state["bpm"].setValue(bpm / 2);
});

drums.part(bpmCounterPart);

drums.system(
  "setup-volume-slider",
  { event: "start" },
  (_world, { p, canvasBounds }) => {
    const menuArea = p.createDiv();
    menuArea.position(canvasBounds.bottom.left.x, canvasBounds.bottom.left.y);
    menuArea.style("display", "flex");

    const icon = p.createSpan("🔊");
    icon.parent(menuArea);

    const volumeSlider = p.createSlider(-46, 4);
    volumeSlider.parent(menuArea);

    (volumeSlider as any).input(() => {
      Tone.getDestination().volume.value = Number(volumeSlider.value());
    });
  }
);

const tabs = [houseTab, hiphopTab];
const drumkits = [parisHouseDrumkit, lofiHipHopDrumkit];
/**
 * Based on the pattern of keypresses entered by the user
 * determine the sequence that should start playing
 */
drums.system(
  "track-keypresses",
  { event: "keypress" },
  (_world, { p }, state) => {
    const keyPresses = state["key-presses"].value;

    keyPresses.push({
      key: p.key,
      time: Date.now(),
    });

    // only keep sliding window of x most recent key presses
    const recentPresses = keyPresses.slice(-4);
    console.debug(recentPresses.map((press) => press.key));
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

/**
 * Play drum sounds based on engine state
 */
drums.system(
  "drum",
  { event: "keypress" },
  (world, { canvasBounds }, state) => {
    const sequenceIndex = state["sequence-index"];

    // TODO: need a way to gaurantee the order of systems executed so that we can assume the keypress state defined by the "pattern-detector" system is set before this runs so that there isn't stuff delayed to the next keypress
    const time = Tone.now();

    let genereToPlay: string | null = null;

    const bpm = state["bpm"].value;

    // Ranges based on the following with a little wiggle room https://www.izotope.com/en/learn/using-different-tempos-to-make-beats-for-different-genres.html
    // It is good to limit these to only certain bpm ranges because it doesnt sound like a hiphop beat when its played over 100 bpm
    // Needs to find ways to make it not so difficult as its hard to keep a consistent bpm when you dont know what you're doing
    if (bpm <= 95) {
      genereToPlay = "hiphop";
    }

    if (bpm >= 100) {
      genereToPlay = "house";
    }

    const sequencesToPlay = tabs.find((tab) => tab.name === genereToPlay);
    const drumkitToPlay = drumkits.find(
      (drumkit) => drumkit.name === genereToPlay
    );

    const textEffectBounds = canvasBounds.shrink(100);

    if (!sequencesToPlay || !drumkitToPlay) {
      parisHouseDrumkit.instruments.kick?.triggerAttackRelease(
        "C2",
        "1n",
        time
      );
      world.addBundle(
        createRandomlyPositionedTextBundle("kick", textEffectBounds)
      );
    } else {
      if (sequencesToPlay.pattern["C"][sequenceIndex.value] === 1) {
        drumkitToPlay.instruments.clap?.triggerAttackRelease("C2", "1n", time);
        world.addBundle(
          createRandomlyPositionedTextBundle("clap", textEffectBounds)
        );
      }

      if (sequencesToPlay.pattern["K"][sequenceIndex.value] === 1) {
        drumkitToPlay.instruments.kick?.triggerAttackRelease("C2", "1n", time);
        world.addBundle(
          createRandomlyPositionedTextBundle("kick", textEffectBounds)
        );
      }

      if (sequencesToPlay.pattern["HH"][sequenceIndex.value] === 1) {
        drumkitToPlay.instruments.hat?.triggerAttackRelease("C2", "1n", time);
        world.addBundle(
          createRandomlyPositionedTextBundle("hat", textEffectBounds)
        );
      }

      if (sequencesToPlay.pattern["S"][sequenceIndex.value] === 1) {
        drumkitToPlay.instruments.snare?.triggerAttackRelease("C2", "1n", time);
        world.addBundle(
          createRandomlyPositionedTextBundle("snare", textEffectBounds)
        );
      }

      if (sequencesToPlay.pattern["OH"][sequenceIndex.value] === 1) {
        drumkitToPlay.instruments.openHat?.triggerAttackRelease(
          "C2",
          "1n",
          time
        );
        world.addBundle(
          createRandomlyPositionedTextBundle("open hat", textEffectBounds)
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
  >(["primitive", "entity-id", "faded"])) {
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
