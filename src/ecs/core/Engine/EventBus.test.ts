import { describe, expect, test, vi } from "vitest";
import EventBus from "./EventBus";

test("listeners subscribed to event should be called when the event is published", () => {
  const eventBus = new EventBus<{ testEvent: unknown }>();
  const listener1 = vi.fn();
  const listener2 = vi.fn();

  eventBus.subscribe("testEvent", listener1);
  eventBus.subscribe("testEvent", listener2);
  eventBus.publish("testEvent");

  expect(listener1).toHaveBeenCalled();
  expect(listener2).toHaveBeenCalled();
});

test("listeners subscribed to other events should not be called when the event is published", () => {
  const eventBus = new EventBus<{
    testEvent: unknown;
    otherEvent: unknown;
  }>();

  const listener = vi.fn();
  eventBus.subscribe("otherEvent", listener);

  eventBus.publish("testEvent");

  expect(listener).not.toHaveBeenCalled();
});
