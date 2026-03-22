import DufusEngine from "./DufusEngine";
import { Engine } from "./Engine";

/**
 * Builder for creating an Engine with type safety and autocompletion for states and events.
 *
 * got this trick from https://medium.hexlabs.io/the-builder-pattern-with-typescript-using-advanced-types-e05a03ffc36e
 *
 */
class EngineBuilder<
  EventMap extends Record<string, unknown> & { init: void } = {
    init: void;
  },
  StateMap extends Record<string, unknown> = {},
> {
  private constructor(private readonly stateSet: StateMap) {}

  /**
   * Register a state
   *
   * @param name
   * @param value
   * @returns
   */
  state<const K extends string, T>(name: K, value: T) {
    const newState = { [name]: value };

    return new EngineBuilder<
      EventMap,
      StateMap & {
        [k in K]: T;
      }
    >({
      ...this.stateSet,
      ...newState,
    });
  }

  event<const K extends string, Payload = void>(name: K) {
    return new EngineBuilder<
      EventMap & {
        [k in K]: Payload;
      },
      StateMap
    >(this.stateSet);
  }

  build(): Engine<
    {
      // Required to condense intersections into a single object type making inferred types easier to read
      [K in keyof EventMap]: EventMap[K];
    },
    {
      [K in keyof StateMap]: StateMap[K];
    }
  > {
    return new DufusEngine<EventMap, StateMap>(this.stateSet);
  }

  static create(): EngineBuilder<{ init: void }> {
    return new EngineBuilder<{ init: void }>({});
  }
}

export { EngineBuilder };
