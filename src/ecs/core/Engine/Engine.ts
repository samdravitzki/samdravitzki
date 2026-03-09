import System, { Dispose, EventEmitter } from "../System/System";
import Bounds from "../Bounds/Bounds";
import { Trigger } from "../Trigger/Trigger";
import { TriggerBuilder } from "../Trigger/TriggerBuilder";
import { Part } from "../Part/Part";

export type EngineOptions = Partial<{
  canvasBounds: Bounds;
}>;

export interface Engine<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> {
  get trigger(): TriggerBuilder<EventMap, StateMap>;

  /**
   * Register a system with the conditions under which it should trigger
   *
   * @param name
   * @param trigger the conditions under which the system should trigger
   * @param system
   */
  system: (
    name: string,
    trigger: Trigger<EventMap, StateMap>,
    s: System<EventMap, StateMap>,
  ) => void;

  /**
   * A part is a set of functionality used to
   * encapsualte engine configuration into reusable,
   * isolated and idependently testable modules
   */
  part: <
    PartEventMap extends Partial<EventMap>,
    PartStateMap extends Partial<StateMap>,
  >(
    p: Part<PartEventMap, PartStateMap>,
  ) => void;
  run: <Key extends keyof EventMap>(event: Key) => void;
  stop(): void;
}
