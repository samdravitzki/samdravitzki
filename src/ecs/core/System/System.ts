import World from "../World/World";
import State from "../State/State";
import { ResourcePool } from "../Engine/ResourcePool";

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
