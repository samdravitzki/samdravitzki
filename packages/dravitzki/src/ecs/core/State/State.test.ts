import { describe, expect, test, vi } from "vitest";
import State from "./State";

describe("onChange method", () => {
  test("should call each change listener when the state changes", () => {
    const state = new State<"start" | "end">("start");
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    state.onChange(listener1);
    state.onChange(listener2);
    state.setValue("end");

    expect(listener1).toHaveBeenCalledWith("end", "start");
    expect(listener2).toHaveBeenCalledWith("end", "start");
  });

  test("should not call change listeners when the state is set to the same value", () => {
    const state = new State<"start" | "end">("start");
    const listener = vi.fn();

    state.onChange(listener);
    state.setValue("start");

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("onTransition method", () => {
  test("should call the listener when the specified 'on-enter' state change occurs", () => {
    const state = new State<"start" | "end">("start");
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    state.onTransition("end", "on-enter", listener1);
    state.onTransition("end", "on-enter", listener2);
    state.setValue("end");

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  test("should call the listener when the specified 'on-exit' state change occurs", () => {
    const state = new State<"start" | "end">("start");
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    state.onTransition("start", "on-exit", listener1);
    state.onTransition("start", "on-exit", listener2);
    state.setValue("end");

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  test("should not call the 'on-enter' listener if the state is set to the same value", () => {
    const state = new State<"start" | "middle" | "end">("start");
    const listener = vi.fn();

    state.onTransition("middle", "on-enter", listener);
    state.setValue("middle");
    state.setValue("middle");

    // Once for the intial change and then never again since the value is the same
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("should not call the 'on-exit' listener if the state is set to the same value", () => {
    const state = new State<"start" | "middle" | "end">("start");
    const listener = vi.fn();

    state.onTransition("start", "on-exit", listener);
    state.setValue("start");
    state.setValue("start");

    expect(listener).not.toHaveBeenCalled();
  });

  test("should not call the listener when a different state change occurs", () => {
    const state = new State<"start" | "middle" | "end">("start");
    const listener = vi.fn();

    state.onTransition("end", "on-enter", listener);
    state.setValue("middle");

    expect(listener).not.toHaveBeenCalled();
  });

  test("should call the 'on-enter' listener if the state is initialized to the value it is registered for", () => {
    const listener = vi.fn();
    const state = new State<"start" | "end">("end");

    state.onTransition("end", "on-enter", listener);

    expect(listener).toHaveBeenCalled();
  });
});
