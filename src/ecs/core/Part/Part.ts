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

// Variance tests - Expected type behaviour when assigning this type to some of its variants
// Uncomment to see in which cases assignments should work

// type MainPart = Part<
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

// type SubPart = Part<{ update: unknown; "after-update": unknown }>;
// type NonSubPart = Part<{ somethingelse: unknown }>;
// type PartialSubPart = Part<{ somethingelse: unknown; update: unknown }>;

// let mainPart: MainPart = {} as MainPart;
// let subPart: SubPart = {} as SubPart;
// let nonSubPart: NonSubPart = {} as NonSubPart;
// let partialSubPart: PartialSubPart = {} as PartialSubPart;

// // const takesMainPart = (part: MainPart) => {};
// // const takesSubPart = (part: SubPart) => {};

// // takesMainPart(subPart); // Want this to work
// // takesMainPart(nonSubPart) // Dont want this to work
// // takesSubPart(mainPart); // Dont want this to work

// // mainPart = subPart; // Dont want this to work
// // subPart = mainPart; // Want this to work
// // mainPart = nonSubPart; // Dont want this to work
// // nonSubPart = mainPart; // Dont want this to work

// class TestEngine<
//   EventMap extends Record<string, unknown> = {},
//   StateMap extends Record<string, unknown> = {},
// > {
//   addPart<
//     PartEventMap extends Partial<EventMap>,
//     PartStateMap extends Partial<StateMap>,
//   >(part: Part<PartEventMap, PartStateMap>) {}
// }

// const eng: TestEngine<
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
// > = {} as any;

// eng.addPart(mainPart); // Should work
// eng.addPart(subPart); // Should work
// eng.addPart(nonSubPart); // Shouldn't work
// eng.addPart(partialSubPart); // Shouldn't work

// type MainState = {
//   init: unknown;
//   setup: unknown;
//   update: unknown;
//   "after-update": unknown;
//   keyPressed: unknown;
// };

// type SubState = {
//   update: unknown;
//   "after-update": unknown;
// };

// const takesMainStateKey = (arg: keyof MainState) => {};
// const takesSubStateKey = (arg: keyof SubState) => {};

// let mainStateKeys: keyof MainState = "" as any;
// let subStateKeys: keyof SubState = "" as any;
// takesMainStateKey(subStateKeys); // Should work
// takesSubStateKey(mainStateKeys); // Should't work
