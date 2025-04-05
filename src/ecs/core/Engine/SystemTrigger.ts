const updateEvents = ["before-update", "update", "after-update"] as const;
export type UpdateEvents = (typeof updateEvents)[number];

export type StartEvent = "start";
export type KeyPressEvent = "keypress";
export type EngineLifecycleEvents = StartEvent | KeyPressEvent | UpdateEvents;

export type SystemTrigger<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
> =
  | { event: StartEvent }
  | { event: KeyPressEvent }
  | {
      event: UpdateEvents;
      readonly condition?: {
        state: K;
        value: StateSet[K];
        // only trigger system on change to state (either on-enter or on-exit)
        only?: "on-enter" | "on-exit";
      };
    };

export function onStart<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(): SystemTrigger<StateSet, K> {
  return {
    event: "start",
  };
}

type OnUpdateTrigger<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
> =
  | SystemTrigger<StateSet, K>
  | {
      if: (state: K, value: StateSet[K]) => SystemTrigger<StateSet, K>;
    };

export function onUpdate<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(): SystemTrigger<StateSet, K> {
  return {
    event: "update",
  };
}

export function onUpdateWhen<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): SystemTrigger<StateSet, K> {
  return {
    event: "update",
    condition: {
      state,
      value,
    },
  };
}

export function onEnter<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): SystemTrigger<StateSet, K> {
  return {
    event: "update",
    condition: {
      state,
      value,
      only: "on-enter",
    },
  };
}

export function onExit<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): SystemTrigger<StateSet, K> {
  return {
    event: "update",
    condition: {
      state,
      value,
      only: "on-exit",
    },
  };
}

export function onKeydown<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(): SystemTrigger<StateSet, K> {
  return {
    event: "keypress",
  };
}
