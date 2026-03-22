type EventListener<T> = (payload: T) => void;

type ListenerStore<EventMap extends Record<string, unknown>> = {
  [Event in keyof EventMap]?: EventListener<EventMap[Event]>[];
};

/**
 * Responsible for receiving event messaging and routing them
 * to listeners that care about the event
 *
 * void is used to represent an event without a payload. void was
 * selected as it best describes the absense of a value, undefined
 * doesn't really fit as it implys the event could have a payload
 * that is defined. unknown also doesn't work as it could imply a
 * payload does exist but we don't know its type.
 */
class EventDipatcher<EventMap extends Record<string, unknown>> {
  private _store: ListenerStore<EventMap> = {};

  /**
   * Subscribe listen to an event
   *
   * @param event the event to listen to
   * @param listener called when the event is published
   */
  subscribe<Event extends keyof EventMap>(
    event: Event,
    listener: EventListener<EventMap[Event]>,
  ) {
    if (!this._store[event]) {
      this._store[event] = [listener];
    } else {
      this._store[event].push(listener);
    }
  }

  /**
   * Publish a new event
   *
   * @param event the event to publish
   * @param payload the payload of the event
   */
  publish<Event extends keyof EventMap>(
    event: Event,
    payload: EventMap[Event],
  ) {
    const listeners = this._store[event] || [];
    for (const listener of listeners) {
      listener(payload);
    }
  }
}

export default EventDipatcher;
export type { EventListener };
