import { Trigger } from "./Trigger";

export type TriggerBuilder<
  EventMap extends Record<string, unknown>,
  StateMap extends Record<string, unknown>,
> = {
  on: <EventKey extends keyof EventMap>(
    event: EventKey,
  ) => { event: EventKey } & {
    when: <StateKey extends keyof StateMap>(
      state: StateKey,
    ) => {
      is: (value: StateMap[StateKey]) => Trigger<EventMap, StateMap, EventKey>;
      enters: (
        value: StateMap[StateKey],
      ) => Trigger<EventMap, StateMap, EventKey>;
      exits: (
        value: StateMap[StateKey],
      ) => Trigger<EventMap, StateMap, EventKey>;
    };
  };
};

export function createTriggerBuilder<
  EventMap extends Record<string, unknown>,
  StateMap extends Record<string, unknown>,
>(): TriggerBuilder<EventMap, StateMap> {
  return {
    on: (event) => {
      return {
        event: event,
        when: (state) => {
          return {
            is: (value) => {
              return {
                event: event,
                condition: { type: "when", state: state, value: value },
              };
            },
            enters: (value) => {
              return {
                event: event,
                condition: {
                  type: "on",
                  transition: "enter",
                  state: state,
                  value: value,
                },
              };
            },
            exits: (value) => {
              return {
                event: event,
                condition: {
                  type: "on",
                  transition: "exit",
                  state: state,
                  value: value,
                },
              };
            },
          };
        },
      };
    },
  };
}
