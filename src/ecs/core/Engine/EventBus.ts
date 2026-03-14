type EventListener = () => void;

class EventBus<EventMap extends Record<string, unknown>> {
  private _subscribers = new Map<keyof EventMap, EventListener[]>();

  subscribe(event: keyof EventMap, listener: EventListener) {
    const listeners = this._subscribers.get(event) || [];
    this._subscribers.set(event, [...listeners, listener]);
  }

  publish(event: keyof EventMap) {
    const listeners = this._subscribers.get(event) || [];
    for (const listener of listeners) {
      listener();
    }
  }
}

export default EventBus;
export type { EventListener };
