import { beforeEach, describe, expect, test, vi } from "vitest";
import DufusEngine from "./DufusEngine";

describe("part method", () => {
  test("should call the provided part function", () => {
    const engine = new DufusEngine({});
    const partFunction = vi.fn();

    engine.part(partFunction);

    expect(partFunction).toHaveBeenCalled();
  });
});

describe("run method", () => {
  test("should execute systems configured to trigger on 'init'", () => {
    const engine = new DufusEngine({});
    const system = vi.fn();
    engine.system("test system", engine.trigger.on("init"), system);

    engine.run();

    expect(system).toHaveBeenCalled();
  });
});

describe("stop method", () => {
  test("should execute all system cleanup functions", () => {
    const engine = new DufusEngine({});
    const cleanup = vi.fn();
    const system = () => cleanup;
    engine.system("test system", engine.trigger.on("init"), system);
    engine.run();

    engine.stop();

    expect(cleanup).toHaveBeenCalled();
  });
});

describe("when a system emits an event", () => {
  type TestState = "start" | "middle" | "end";

  let engine: DufusEngine<
    { init: unknown; "test-event": unknown; "other-event": unknown },
    { testState: TestState }
  >;

  beforeEach(() => {
    engine = new DufusEngine({ testState: "start" as TestState });
  });

  describe("on event triggers", () => {
    test("all systems configured to trigger on the event should be run", () => {
      engine.system(
        "emtitter system",
        engine.trigger.on("init"),
        (world, resources, store, emitter) =>
          emitter.emit({ event: "test-event" }),
      );

      const dependentSystem1 = vi.fn();
      engine.system(
        "dependentSystem 1",
        engine.trigger.on("test-event"),
        dependentSystem1,
      );
      const dependentSystem2 = vi.fn();
      engine.system(
        "dependentSystem 2",
        engine.trigger.on("test-event"),
        dependentSystem2,
      );

      engine.run();

      expect(dependentSystem1).toHaveBeenCalled();
      expect(dependentSystem2).toHaveBeenCalled();
    });

    test("any systems who aren't set to trigger on the event should not be run", () => {
      engine.system(
        "emtitter system",
        engine.trigger.on("init"),
        (world, resources, store, emitter) =>
          emitter.emit({ event: "test-event" }),
      );
      const dependentSystem = vi.fn();
      engine.system(
        "dependentSystem",
        engine.trigger.on("other-event"),
        dependentSystem,
      );

      engine.run();

      expect(dependentSystem).not.toHaveBeenCalled();
    });
  });

  describe("trigger when state is x", () => {
    test("should call system when state is the value specified in the trigger", () => {
      engine.system(
        "emtitter system",
        engine.trigger.on("init"),
        (world, resources, store, emitter) => {
          store.testState.setValue("end");
          emitter.emit({ event: "test-event" });
        },
      );

      const system = vi.fn();
      engine.system(
        "system 2",
        engine.trigger.on("test-event").when("testState").is("end"),
        system,
      );

      engine.run();
      engine.run();

      expect(system).toHaveBeenCalledTimes(2);
    });

    test("should not call system when state is not the value specified in the trigger", () => {
      engine.system(
        "emtitter system",
        engine.trigger.on("init"),
        (world, resources, store, emitter) => {
          store.testState.setValue("middle");
          emitter.emit({ event: "test-event" });
        },
      );

      const system = vi.fn();
      engine.system(
        "system 2",
        engine.trigger.on("test-event").when("testState").is("end"),
        system,
      );

      engine.run();
      engine.run();

      expect(system).not.toHaveBeenCalled();
    });
  });

  describe("trigger when state changes", () => {
    test.todo(
      "should trigger system if the state has changed and the event has been emitted",
    );
    test.todo(
      "should not trigger system if the state has not changed and the event has been emitted",
    );
    test.todo(
      "should not trigger system if the state has changed but the event has not been emitted",
    );
  });
});
