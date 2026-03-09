import p5 from "p5";
import System, { Dispose, EventEmitter } from "../System/System";
import World from "../World/World";
import Bounds from "../Bounds/Bounds";
import State from "../State/State";
import { ResourcePool } from "./ResourcePool";
import { Trigger, TriggerCondition } from "../Trigger/Trigger";
import {
  createTriggerBuilder,
  TriggerBuilder,
} from "../Trigger/TriggerBuilder";
import { Part } from "../Part/Part";

export type EngineOptions = Partial<{
  canvasBounds: Bounds;
}>;

type States<StateMap extends Record<string, unknown> = {}> = {
  [Key in keyof StateMap]: State<StateMap[Key]>;
};

export interface Engine<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> {
  get trigger(): TriggerBuilder<EventMap, StateMap>;

  /**
   * Register a system with the conditions under which it should trigger
   *
   * @param name
   * @param trigger the conditions under which the system should trigger
   * @param system
   */
  system: (
    name: string,
    trigger: Trigger<EventMap, StateMap>,
    s: System<EventMap, StateMap>,
  ) => void;

  /**
   * A part is a set of functionality used to
   * encapsualte engine configuration into reusable,
   * isolated and idependently testable modules
   */
  part: <
    PartEventMap extends Partial<EventMap>,
    PartStateMap extends Partial<StateMap>,
  >(
    p: Part<PartEventMap, PartStateMap>,
  ) => void;
  run: <Key extends keyof EventMap>(event: Key) => void;
  stop(): void;
}

/**
 * Designed based bevy ecs app builder api https://bevy-cheatbook.github.io/programming/app-builder.html
 */
class DufusEngine<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> implements Engine<EventMap, StateMap> {
  private _eventBus: Map<
    keyof EventMap,
    {
      system: System<EventMap, StateMap>;
      condition?: TriggerCondition<StateMap>;
    }[]
  > = new Map();

  private _store: States<StateMap>;

  private _world = new World();

  private _resources = new ResourcePool();

  private _cleanup: Dispose[] = [];

  /**
   * Add events (assuming event is the right name for what im envisioning here)
   *
   * Current ideas around how events should work
   * - Should be able to define systems that run when events trigger
   * - Should be able to define systems that trigger events
   * - Should be able to configure how long an event sticks around for
   * - Events should only last for the frame they are triggered and the next frame by default
   * - If an event is triggered in a frame and a system listening to it is yet to
   *   trigger it should run in the same frame
   *
   * - Use events to handle listening to changes in state
   *  - When the state changes it should add an event which should then
   *    cause any systems listening to state change events to run
   *
   * - Could also use events to trigger systems that run on p5 lifecycle events
   *   like start and draw. When p5 start function is called it could trigger a "start"
   *   event that all systems listen to.
   *
   * - Opportunity to learn more about datastructures and algorithms as this
   *   may be a good opportunity to apply some here
   */

  constructor(stateSet: StateMap, options: EngineOptions = {}) {
    this._store = Object.keys(stateSet).reduce((prev, next) => {
      return {
        ...prev,
        [next]: new State(stateSet[next]),
      };
    }, {}) as States<StateMap>;
  }

  system(
    name: string, // Remove this name field - no longer used
    trigger: Trigger<EventMap, StateMap>,
    sys: System<EventMap, StateMap>,
  ): void {
    const systems = this._eventBus.get(trigger.event) || [];
    systems.push({
      system: sys,
      condition: trigger.condition,
    });
    this._eventBus.set(trigger.event, systems);
  }

  get trigger() {
    return createTriggerBuilder<EventMap, StateMap>();
  }

  part<
    PartEventMap extends Partial<EventMap>,
    PartStateMap extends Partial<StateMap>,
  >(p: Part<PartEventMap, PartStateMap>) {
    p({
      registerSystem: (
        name: string,
        trigger: Trigger<PartEventMap, PartStateMap>,
        sys: System<PartEventMap, PartStateMap>,
      ) => {
        // Figure out how to structure these types so that these assertions are not needed
        this.system(
          name,
          trigger as Trigger<EventMap, StateMap>,
          sys as unknown as System<EventMap, StateMap>,
        );
      },
      triggerBuilder: createTriggerBuilder<PartEventMap, PartStateMap>(),
    });
  }

  /**
   * Renders and runs the game within a HTML canvas element
   * @param parent optionally supply the parent element to render visuals within
   */
  run<Key extends keyof EventMap>(event: Key) {
    const systems = this._eventBus.get(event) || [];

    for (const { system, condition } of systems) {
      const cleanup = system(this._world, this._resources, this._store, {
        emit: ({ event: emittedEvent }) => {
          console.debug(`Emitted event: ${String(emittedEvent)}`);

          if (condition === undefined) {
            // Figure out how to structure these types so that these assertions are not needed
            this.run(emittedEvent as keyof EventMap); // Figure out how to remove this type assertion, currently needed to satisfy typescript that the emitted event is a key of the event map
          } else {
            if (
              condition.type === "when" &&
              this._store[condition.state].value === condition.value
            ) {
              // Figure out how to structure these types so that these assertions are not needed
              this.run(emittedEvent as keyof EventMap);
            }
          }
        },
      });

      if (cleanup) {
        this._cleanup.push(cleanup);
      }
    }
  }

  stop() {
    console.debug("Stopped");
    this._cleanup.forEach((cleanup) => cleanup());
  }
}

export default DufusEngine;
