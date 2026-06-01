import World from "../World/World";
import State from "../State/State";
import { ResourcePool } from "../Engine/ResourcePool";
import { EventEmitter } from "../Engine/EventEmitter";

type Dispose = () => void;

/**
 * An ECS system, create systems to implement behaviour on the ECS world
 */
type System<
  EventMap extends Record<string, unknown>,
  StateMap extends Record<string, unknown>,
  Event extends keyof EventMap,
> = (
  world: World,
  resources: ResourcePool,
  state: {
    [Key in keyof StateMap]: State<StateMap[Key]>;
  },
  eventEmitter: EventEmitter<EventMap>,
  eventPayload: EventMap[Event],
) => Dispose | void;

export default System;

export type { EventEmitter, Dispose };
