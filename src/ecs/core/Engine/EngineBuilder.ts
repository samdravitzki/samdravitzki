import DufusEngine from "./DufusEngine";
import { EngineOptions, Engine } from "./Engine";

/**
 * Testing out this way of implementing the builder pattern in typescript
 * so that as you run each build command it also incrementally builds the
 * types.
 *
 * Motivation: Currently there is an issue where when each state is added to
 * the engine there is no way for the systems to access the types of state
 * avaible and so each of them has to run their own checks to see if the
 * state they are accessing exists
 *
 * got this trick from https://medium.hexlabs.io/the-builder-pattern-with-typescript-using-advanced-types-e05a03ffc36e
 *
 * TODO: I want to see if this can be combined with the engine class so that the consumer can directly use something called "Engine"
 */
class EngineBuilder<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> {
  private constructor(private readonly stateSet: StateMap) {}

  /**
   * Register a state
   *
   * NOTE: The resulting object is pretty verbose due to all of the "&"
   * causes by the intersection done on each call to state. This issue
   * can be resolved using "Expand" types as described in the article
   * above. I have chosen to leave this out for now to keep things simple
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

  event<const K extends string>(name: K) {
    return new EngineBuilder<
      EventMap & {
        [k in K]: unknown;
      },
      StateMap
    >(this.stateSet);
  }

  build(options: EngineOptions = {}): Engine<
    {
      [K in keyof EventMap]: EventMap[K]; // Required to condense intersections into a single object type making inferred types easier to read
    },
    {
      [K in keyof StateMap]: StateMap[K];
    }
  > {
    return new DufusEngine<EventMap, StateMap>(this.stateSet, options);
  }

  static create(): EngineBuilder<{ init: unknown }> {
    return new EngineBuilder<{ init: unknown }>({});
  }
}

export { EngineBuilder };
