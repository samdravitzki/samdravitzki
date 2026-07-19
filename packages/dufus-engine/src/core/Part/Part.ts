import System from "../System/System";
import { Trigger } from "../Trigger/Trigger";
import { TriggerBuilder } from "../Trigger/TriggerBuilder";

type EngineContext<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> = {
  triggerBuilder: TriggerBuilder<EventMap, StateMap>;
  registerSystem: <Event extends keyof EventMap>(
    name: string,
    trigger: Trigger<EventMap, StateMap, Event>,
    system: System<EventMap, StateMap, Event>,
  ) => void;
};

export type Part<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> = (context: EngineContext<EventMap, StateMap>) => void;
