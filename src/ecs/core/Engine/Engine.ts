import System from "../System/System";
import { Trigger } from "../Trigger/Trigger";
import { TriggerBuilder } from "../Trigger/TriggerBuilder";
import { Part } from "../Part/Part";

export interface Engine<
  EventMap extends Record<string, unknown> & { init: unknown },
  StateMap extends Record<string, unknown>,
> {
  get trigger(): TriggerBuilder<EventMap, StateMap>;

  /**
   * Register a system with the conditions under which it should trigger
   *
   * @param name
   * @param trigger the conditions under which the system should trigger
   * @param system
   */
  system: <Event extends keyof EventMap>(
    name: string,
    trigger: Trigger<EventMap, StateMap, Event>,
    s: System<EventMap, StateMap, Event>,
  ) => void;

  /**
   * Extend the engine by adding a part
   *
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

  run: () => void;

  stop(): void;
}
