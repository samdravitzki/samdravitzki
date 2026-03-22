import { describe, expect, test, vi } from "vitest";
import EventDipatcher from "./EventBus";

test("listeners subscribed to event should be called when the event is published with the same payload", () => {
  const eventBus = new EventDipatcher<{ testEvent: string }>();
  const listener1 = vi.fn();
  const listener2 = vi.fn();
  const testPaylaod = "test-payload";

  eventBus.subscribe("testEvent", listener1);
  eventBus.subscribe("testEvent", listener2);
  eventBus.publish("testEvent", testPaylaod);

  expect(listener1).toHaveBeenCalledExactlyOnceWith(testPaylaod);
  expect(listener2).toHaveBeenCalledExactlyOnceWith(testPaylaod);
});

test("listeners subscribed to other events should not be called when the event is published", () => {
  const eventBus = new EventDipatcher<{
    testEvent: unknown;
    otherEvent: unknown;
  }>();

  const listener = vi.fn();
  eventBus.subscribe("otherEvent", listener);

  eventBus.publish("testEvent");

  expect(listener).not.toHaveBeenCalled();
});
