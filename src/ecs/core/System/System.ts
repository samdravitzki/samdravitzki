import World from "../World/World";
import State from "../State/State";
import { ResourcePool } from "../Engine/ResourcePool";

// Replace with *Disposable* and *using* when it is better supported by browsers (at the time of writing it is not supported by safari)
type Dispose = () => void;

type EventPayloadPairs<EventMap extends Record<string, unknown>> = {
  [EventKey in keyof EventMap]: {
    event: EventKey;
    payload?: EventMap[EventKey];
  };
}[keyof EventMap];

type EventEmitter<EventMap extends Record<string, unknown>> = {
  emit: <EmitterEventMap extends EventMap>(
    events: EventPayloadPairs<EmitterEventMap>,
  ) => void;
};

/**
 * An ECS system, create systems to implement behaviour on the ECS world
 */
type System<
  EventMap extends Record<string, unknown>,
  StateMap extends Record<string, unknown>,
> = (
  world: World,
  resources: ResourcePool,
  state: {
    [Key in keyof StateMap]: State<StateMap[Key]>;
  },
  eventEmitter: EventEmitter<EventMap>,
) => Dispose | void;

export default System;

export type { EventEmitter, Dispose };

// // Variance tests - Expected type behaviour when assigning this type to some of its variants
// type MainSystem = System<
//   {
//     init: unknown;
//     setup: unknown;
//     update: unknown;
//     "after-update": unknown;
//     keyPressed: unknown;
//   },
//   {
//     "render-trajectory": boolean;
//     score: [number, number];
//     "app-state": "a" | "b" | "c";
//   }
// >;

// type SubSystem = System<{ update: unknown; "after-update": unknown }, {}>;

// let mainSystem: MainSystem = {} as MainSystem;

// let subSystem: SubSystem = {} as SubSystem;
// // Expect System to be ???

// mainSystem = subSystem; // Figure out expected behavior
// subSystem = mainSystem;
