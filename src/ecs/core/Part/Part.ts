import System from "../System/System";
import { Trigger } from "../Trigger/Trigger";
import { TriggerBuilder } from "../Trigger/TriggerBuilder";

type EngineContext<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> = {
  triggerBuilder: TriggerBuilder<EventMap, StateMap>;
  registerSystem: (
    name: string,
    trigger: Trigger<EventMap, StateMap>,
    system: System<EventMap, StateMap>,
  ) => void;
};

export type Part<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> = (context: EngineContext<EventMap, StateMap>) => void;
