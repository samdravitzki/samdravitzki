import { Trigger } from "./Trigger";

export type TriggerBuilder<
  EventMap extends Record<string, unknown>,
  StateMap extends Record<string, unknown>,
> = {
  on: <EventKey extends keyof EventMap>(
    event: EventKey,
  ) => { event: keyof EventMap } & {
    when: <StateKey extends keyof StateMap>(
      state: StateKey,
    ) => {
      is: (value: StateMap[StateKey]) => Trigger<EventMap, StateMap>;
      enters: (value: StateMap[StateKey]) => Trigger<EventMap, StateMap>;
      exits: (value: StateMap[StateKey]) => Trigger<EventMap, StateMap>;
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

// // Variance tests - Expected type behaviour when assigning this type to some of its variants
// type MainTriggerBuilder = TriggerBuilder<
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

// type SubTriggerBuilder = TriggerBuilder<
//   { update: unknown; "after-update": unknown },
//   {}
// >;

// let mainBuilder: MainTriggerBuilder = {} as MainTriggerBuilder;

// let subBuilder: SubTriggerBuilder = {} as SubTriggerBuilder;

// // Expect TriggerBuilder to be covariant
// mainBuilder = subBuilder; // Should be able to assign sub builder to the main builder this to work
// subBuilder = mainBuilder; // Should not be able to assign main builder to the sub builder this to work
