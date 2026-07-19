type EventEmitter<EventMap extends Record<string, unknown>> = {
  emit: <Map extends EventMap, K extends keyof Map>(event: {
    event: K;
    payload?: Map[K];
  }) => void;
};

export type { EventEmitter };
