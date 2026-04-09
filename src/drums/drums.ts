import * as Tone from "tone";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { PrimitiveShape } from "../ecs/parts/p5/primitive-renderer/components/Primitive";
import Component from "../ecs/core/Component/Component";
import bpmCounterPart, { Keypress } from "./parts/bpm-counter";
import hiphopTab from "./tabs/hiphop";
import houseTab from "./tabs/house";
import { lofiHipHopDrumkit } from "./drumkits/lofi-hiphop";
import { parisHouseDrumkit } from "./drumkits/paris-house";
import { createRandomlyPositionedTextBundle } from "./createRandomlyPositionedTextBundle";
import { deriveBpm } from "./deriveBpm";
import volumeSliderPart from "./parts/volume-slider";
import World from "../ecs/core/World/World";
import p5 from "p5";
import State from "../ecs/core/State/State";
import Bounds from "../ecs/core/Bounds/Bounds";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import p5Part, { KeypressEvent } from "../ecs/parts/p5/p5-part";
import { EventEmitter } from "../ecs/core/System/System";

const tabs = {
  house: houseTab,
  hiphop: hiphopTab,
};

const drumkits = {
  house: parisHouseDrumkit,
  hiphop: lofiHipHopDrumkit,
};

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

/**
 * Calculate the bpm as the user taps it out
 *
 * Based on https://www.all8.com/tools/bpm.htm
 */
function calculateBpm(
  _world: World,
  _resources: ResourcePool,
  state: { "key-presses": State<Keypress[]>; bpm: State<number> },
) {
  const keyPresses = state["key-presses"];
  // The difference between each consecutive time
  const bpm = deriveBpm(keyPresses.value.map((press) => press.time));
  // I remove every odd beat in a tab to remove any rests and so have doubled the bpm to account for this
  state["bpm"].setValue(bpm / 2);
}

/**
 * Based on the pattern of keypresses entered by the user
 * determine the sequence that should start playing
 */
function keypressTrackingSystem(
  _world: World,
  resources: ResourcePool,
  state: { "key-presses": State<Keypress[]> },
) {
  const p = resources.get<p5>("p5");
  const keyPresses = state["key-presses"].value;

  keyPresses.push({
    key: p.key,
    time: Date.now(),
  });

  // only keep sliding window of x most recent key presses
  const recentPresses = keyPresses.slice(-4);
  state["key-presses"].setValue(recentPresses);
}

/**
 * On keypress increment through 8 note sequence
 */
function sequenceIncrementerSystem(
  _world: World,
  _resources: ResourcePool,
  state: { "sequence-index": State<number> },
) {
  const sequenceIndex = state["sequence-index"];
  const nextIndex = (sequenceIndex.value + 1) % 8;
  sequenceIndex.setValue(nextIndex);
}

function genreSelector(
  world: World,
  resource: ResourcePool,
  state: { bpm: State<number>; genre: State<string> },
) {
  const bpm = state["bpm"].value;

  // Ranges based on the following with a little wiggle room https://www.izotope.com/en/learn/using-different-tempos-to-make-beats-for-different-genres.html
  // Needs to find ways to make it not so difficult as its hard to keep a consistent bpm when you dont know what you're doing
  if (bpm <= 95) {
    state.genre.setValue("hiphop");
  } else if (bpm >= 100) {
    state.genre.setValue("house");
  }
}

/**
 * Play drum sounds based on engine state
 */
function drumSystem(
  world: World,
  resources: ResourcePool,
  state: { "sequence-index": State<number>; genre: State<string> },
  emitter: EventEmitter<{ hit: DrumHitEventPayload }>,
) {
  const sequenceIndex = state["sequence-index"];

  const time = Tone.now();

  const genereToPlay = state.genre.value;

  const sequencesToPlay = tabs[genereToPlay as keyof typeof tabs];

  if (!sequencesToPlay) {
    emitter.emit({ event: "hit", payload: { element: "kick", time: time } });
  } else {
    if (sequencesToPlay.pattern["C"][sequenceIndex.value] === 1) {
      emitter.emit({ event: "hit", payload: { element: "clap", time: time } });
    }

    if (sequencesToPlay.pattern["K"][sequenceIndex.value] === 1) {
      emitter.emit({ event: "hit", payload: { element: "kick", time: time } });
    }

    if (sequencesToPlay.pattern["HH"][sequenceIndex.value] === 1) {
      emitter.emit({ event: "hit", payload: { element: "hat", time: time } });
    }

    if (sequencesToPlay.pattern["S"][sequenceIndex.value] === 1) {
      emitter.emit({ event: "hit", payload: { element: "snare", time: time } });
    }

    if (sequencesToPlay.pattern["OH"][sequenceIndex.value] === 1) {
      emitter.emit({
        event: "hit",
        payload: { element: "openHat", time: time },
      });
    }
  }
}

function drumPlayer(
  world: World,
  resources: ResourcePool,
  state: { genre: State<string> },
  eventEmitter: unknown,
  drumEvent: DrumHitEventPayload,
) {
  const genereToPlay = state.genre.value;

  const kitType = genereToPlay as keyof typeof drumkits;
  const drumkitToPlay = drumkits[kitType];

  const element = drumEvent.element as keyof typeof drumkitToPlay.instruments;

  const intrument = drumkitToPlay.instruments[element];

  intrument?.triggerAttackRelease("C2", "1n", drumEvent.time);
}

function drumElementDisplay(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  drumEvent: DrumHitEventPayload,
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const textEffectBounds = canvasBounds.shrink(100);
  world.addBundle(
    createRandomlyPositionedTextBundle(drumEvent.element, textEffectBounds),
  );
}

export type TextEffectComponent = Component & {
  name: "text";
};

/**
 * Fade out any text effect entities over time and when they are no
 * longer visible remove them
 */
function textFadeSystem(world: World, resources: ResourcePool) {
  for (const [primitive, entityId] of world.query<
    [PrimitiveShape, string, TextEffectComponent]
  >(["primitive", "entity-id", "faded"])) {
    const p = resources.get<p5>("p5");
    if (primitive.fill) {
      const [r, g, b, alpha] = primitive.fill as number[];

      const fadeSpeed = 0.4;
      const newAlpha = alpha - p.deltaTime * fadeSpeed;

      if (newAlpha <= 0) {
        world.removeEntity(entityId);
      }

      primitive.fill = [r, g, b, newAlpha];
    }
  }
}

type DrumHitEventPayload = { element: string; time: number };

export default function drums(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .event("after-update")
    .event<"hit", DrumHitEventPayload>("hit")
    .state("sequence-index", 0)
    .state<"key-presses", Keypress[]>("key-presses", [])
    .state("bpm", 0)
    .state<"genre", string>("genre", "dead-air")
    .build();

  const t = engine.trigger;

  engine.part(p5Part([500, 500], parent));

  engine.system("calculate-bpm", t.on("keyPressed"), calculateBpm);

  engine.part(bpmCounterPart);
  engine.part(volumeSliderPart);

  engine.system("track-keypresses", t.on("keyPressed"), keypressTrackingSystem);
  engine.system("sequencer", t.on("keyPressed"), sequenceIncrementerSystem);

  engine.system("genre-selector", t.on("keyPressed"), genreSelector);
  engine.system("drum", t.on("keyPressed"), drumSystem);

  engine.system("element-display", t.on("hit"), drumElementDisplay);
  engine.system("player", t.on("hit"), drumPlayer);

  engine.system("text-fade", t.on("update"), textFadeSystem);

  return engine;
}
