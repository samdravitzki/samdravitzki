export function onStart(): { event: string } {
  return {
    event: "start",
  };
}

export function onUpdate(): { event: string } {
  return {
    event: "update",
  };
}

export function onUpdateWhen<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): { event: string } {
  return {
    event: "update",
  };
}

export function onEnter<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): { event: string } {
  return {
    event: "state-change",
  };
}

export function onExit<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
>(state: K, value: StateSet[K]): { event: string } {
  return {
    event: "state-change",
  };
}

export function onKeydown(): { event: string } {
  return {
    event: "keypress",
  };
}
