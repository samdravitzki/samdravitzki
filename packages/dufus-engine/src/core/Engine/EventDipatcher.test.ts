import { expect, test, vi } from "vitest";
import EventDipatcher from "./EventDipatcher";

test("listeners subscribed to event should be called when the event is published", () => {
  const eventBus = new EventDipatcher<{ testEvent: void }>();
  const listener1 = vi.fn();
  const listener2 = vi.fn();
  const testPaylaod = "test-payload";

  eventBus.subscribe("testEvent", listener1);
  eventBus.subscribe("testEvent", listener2);
  eventBus.publish("testEvent", undefined);

  expect(listener1).toHaveBeenCalledExactlyOnceWith(undefined);
  expect(listener2).toHaveBeenCalledExactlyOnceWith(undefined);
});

test("listeners should be supplied payload of published events", () => {
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
    testEvent: void;
    otherEvent: void;
  }>();

  const listener = vi.fn();
  eventBus.subscribe("otherEvent", listener);

  eventBus.publish("testEvent", undefined);

  expect(listener).not.toHaveBeenCalled();
});
