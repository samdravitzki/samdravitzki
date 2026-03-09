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
> = {
  event: keyof EventMap;
} & {
  condition?: TriggerCondition<StateMap>;
};

// Variance tests - Expected type behaviour when assigning this type to some of its variants

// type MainTrigger = Trigger<
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

// type SubTrigger = Trigger<{ update: unknown; "after-update": unknown }, {}>;

// let mainTrigger: MainTrigger = {} as MainTrigger;

// let subTrigger: SubTrigger = {} as SubTrigger;

// // Expect Trigger to be covariant
// mainTrigger = subTrigger; // Should be able to assign sub trigger to the main trigger this to work
// subTrigger = mainTrigger; // Should not be able to assign main trigger to the sub trigger this to work
