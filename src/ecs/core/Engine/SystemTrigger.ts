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

export type ScheduleTrigger<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
> = {
  schedule: string; // the schedule the system will be run under
  readonly condition?: {
    state: K;
    value: StateSet[K];
  };
};

function onStart() {
  return {
    shedule: "start",
  };
}

function onUpdate() {
  return {
    shedule: "update",
    if(state: string, value: string) {
      return {
        shedule: "update",
        condition: {
          state,
          value,
        },
      };
    },
  };
}

function onEnter(state: string, value: string) {
  return {
    shedule: "state-change",
    on: "enter",
    condition: {
      state,
      value,
    },
  };
}

function onExit(state: string, value: string) {
  return {
    shedule: "state-change",
    on: "exit",
    condition: {
      state,
      value,
    },
  };
}

function onKeydown() {
  return {
    shedule: "event",
    event: "keypress",
  };
}
