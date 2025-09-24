/**
 * Try working out how to manage these systems
 * by first getting all of the information around when
 * they are supposed to run to the engine. Once the engine
 * has all the info then build something that takes
 * all the system then based on the state of the
 * system figures out which systems should run
 * in a frame
 */

type Trigger = {
  event: string;
};

export function onStart(): Trigger {
  return {
    event: "start",
  };
}

export function onUpdate(): Trigger {
  return {
    event: "update",
  };
}

type WhenTrigger<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
> = Trigger & {
  when: {
    state: K;
    value: StateSet[K];
  };
};

export function when<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): WhenTrigger<StateSet, K> {
  return {
    event: "update",
    when: {
      state,
      value,
    },
  };
}

type OnTrigger<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
> = Trigger & {
  on: {
    transition: "enter" | "exit";
    state: K;
    value: StateSet[K];
  };
};

export function onEnter<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): OnTrigger<StateSet, K> {
  return {
    event: "state-change",
    on: {
      transition: "enter",
      state,
      value,
    },
  };
}

export function onExit<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): OnTrigger<StateSet, K> {
  return {
    event: "state-change",
    on: {
      transition: "exit",
      state,
      value,
    },
  };
}

export function onKeydown(): { event: string } {
  return {
    event: "keypress",
  };
}
