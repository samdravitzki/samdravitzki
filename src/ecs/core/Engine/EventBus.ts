type EventListener<T> = (payload: T | undefined) => void;

type ListenerStore<EventMap extends Record<string, unknown>> = {
  [EventKey in keyof EventMap]?: EventListener<EventMap[EventKey]>[];
};

/**
 * Responsible for receiving event messaging and routing them
 * to listeners that care about the event
 */
class EventDipatcher<EventMap extends Record<string, unknown>> {
  private _store: ListenerStore<EventMap> = {};

  subscribe<EventKey extends keyof EventMap>(
    event: EventKey,
    listener: EventListener<EventMap[EventKey]>,
  ) {
    if (!this._store[event]) {
      this._store[event] = [listener];
    } else {
      this._store[event].push(listener);
    }
  }

  publish<EventKey extends keyof EventMap>(
    event: EventKey,
    payload?: EventMap[EventKey],
  ) {
    const listeners = this._store[event] || [];
    for (const listener of listeners) {
      listener(payload);
    }
  }
}

export default EventDipatcher;
export type { EventListener };
