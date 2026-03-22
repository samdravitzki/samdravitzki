/**
 * Converts
 * type StateMap = {
 *   status: "idle" | "running";
 *   count: number;
 *   mode: "auto" | "manual";
 * };
 *
 * to
 *
 * {
 *  state: "status";
 *  value: "idle" | "running";
 * } | {
 *  state: "count";
 *  value: number;
 * } | ...
 *
 *
 */
type StateValuePairs<StateMap extends Record<string, unknown>> = {
  [StateKey in keyof StateMap]: {
    state: StateKey;
    value: StateMap[StateKey];
  };
}[keyof StateMap];

export type TriggerCondition<StateMap extends Record<string, unknown>> =
  | (StateValuePairs<StateMap> & {
      type: "on";
      transition: "enter" | "exit";
    })
  | (StateValuePairs<StateMap> & {
      type: "when";
    });

export type Trigger<
  EventMap extends Record<string, unknown>,
  StateMap extends Record<string, unknown>,
  Event extends keyof EventMap,
> = {
  event: Event;
} & {
  condition?: TriggerCondition<StateMap>;
};
