import { Engine, EngineOptions } from "./Engine";
import { ResourcePool } from "./ResourcePool";
import { Part } from "../Part/Part";
import State from "../State/State";
import System, { Dispose } from "../System/System";
import { TriggerCondition, Trigger } from "../Trigger/Trigger";
import { createTriggerBuilder } from "../Trigger/TriggerBuilder";
import World from "../World/World";

type States<StateMap extends Record<string, unknown> = {}> = {
  [Key in keyof StateMap]: State<StateMap[Key]>;
};

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

type SystemRegistration<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> = {
  system: System<EventMap, StateMap>;
  trigger: Trigger<EventMap, StateMap>;
};

/**
 * Designed based bevy ecs app builder api https://bevy-cheatbook.github.io/programming/app-builder.html
 */
class DufusEngine<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> implements Engine<EventMap, StateMap> {
  private _eventBus = new EventBus<EventMap>();

  private _store: States<StateMap>;

  // Number of times a state change a system is dependent on has occured
  // Needed so that when the event the system is dependent on triggers it can determine wheter it should run
  private _stateChangeTracker = new Map<System<EventMap, StateMap>, number>();

  private _world = new World();

  private _resources = new ResourcePool();

  private _systems: SystemRegistration<EventMap, StateMap>[] = [];

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

  constructor(stateSet: StateMap) {
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
    s: System<EventMap, StateMap>,
  ): void {
    this._systems.push({
      system: s,
      trigger,
    });

    if (trigger.condition && trigger.condition.type === "on") {
      const state = this._store[trigger.condition.state];
      const transitionMap = {
        enter: "on-enter" as const,
        exit: "on-exit" as const,
      };

      state.onTransition(
        trigger.condition.value,
        transitionMap[trigger.condition.transition],
        () => {
          const count = this._stateChangeTracker.get(s);
          if (!count) {
            this._stateChangeTracker.set(s, 1);
          } else {
            this._stateChangeTracker.set(s, count + 1);
          }
        },
      );
    }
  }

  get trigger() {
    return createTriggerBuilder<EventMap, StateMap>();
  }

  part<
    PartEventMap extends Partial<EventMap>,
    PartStateMap extends Partial<StateMap>,
  >(p: Part<PartEventMap, PartStateMap>) {
    p({
      registerSystem: (name, trigger, sys) => {
        // Would like to figure out how to structure these types so that these assertions are not needed
        this.system(
          name,
          trigger as Trigger<EventMap, StateMap>,
          sys as unknown as System<EventMap, StateMap>,
        );
      },
      triggerBuilder: createTriggerBuilder<PartEventMap, PartStateMap>(),
    });
  }

  private _executeSystem(system: System<EventMap, StateMap>) {
    system(this._world, this._resources, this._store, {
      emit: ({ event: emittedEvent }) =>
        // This type assertion is also an issue I would like to resolve
        this._eventBus.publish(emittedEvent as keyof EventMap),
    });
  }

  /**
   * Renders and runs the game within a HTML canvas element
   * @param parent optionally supply the parent element to render visuals within
   */
  run<Key extends keyof EventMap>(event: Key) {
    const systemEventGroups = groupSystemsByEvent(this._systems);
    logSystemRegistrations(this._systems);

    // Link systems into events
    Object.keys(systemEventGroups).map((event) => {
      this._eventBus.subscribe(event, () => {
        systemEventGroups[event].map(({ trigger, system }) => {
          if (
            !trigger.condition ||
            (trigger.condition.type === "when" &&
              this._store[trigger.condition.state].value ===
                trigger.condition.value)
          ) {
            this._executeSystem(system);
            return;
          }

          if (trigger.condition.type === "on") {
            const hasStateTransitioned = this._stateChangeTracker.get(system);
            if (hasStateTransitioned) {
              this._executeSystem(system);
              this._stateChangeTracker.set(system, 0);
            }
          }
        });
      });
    });

    // Log state changes
    Object.keys(this._store).map((name) => {
      const state = this._store[name];
      state.onChange((to, from) =>
        console.debug(
          `(state) ${name} is ${JSON.stringify(to)} (was ${JSON.stringify(from)})`,
        ),
      );
    });

    this._eventBus.publish("init");
  }

  /**
   * when trigger
   * if (trigger.condition === "when" && this._state[trigger.condition.state].value === trigger.condition.value) { //... }
   *
   * on trigger
   *
   * if (trigger.condition === "on" && )
   */

  stop() {
    console.log("Stopped");
    // this._cleanup.forEach((cleanup) => cleanup()); // Need to get the cleanup stuff working
  }
}

type EventSystemMap<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> = Record<keyof EventMap, SystemRegistration<EventMap, StateMap>[]>;

function groupSystemsByEvent<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
>(systemRegistrations: SystemRegistration<EventMap, StateMap>[]) {
  return systemRegistrations.reduce<EventSystemMap<EventMap, StateMap>>(
    (groups, systemReg) => {
      if (groups[systemReg.trigger.event] === undefined) {
        return {
          ...groups,
          [systemReg.trigger.event]: [systemReg],
        };
      }

      return {
        ...groups,
        [systemReg.trigger.event]: [
          ...groups[systemReg.trigger.event],
          systemReg,
        ],
      };
    },
    {} as EventSystemMap<EventMap, StateMap>,
  );
}

function logSystemRegistrations<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
>(systemRegistrations: SystemRegistration<EventMap, StateMap>[]) {
  const systemEventGroups = groupSystemsByEvent(systemRegistrations);

  Object.keys(systemEventGroups)
    .sort()
    .map((event) => {
      console.group(`${event} event`);
      systemEventGroups[event].map(({ trigger, system }) => {
        if (!trigger.condition) {
          console.log(system.name);
          return;
        }

        if (trigger.condition.type === "when") {
          console.log(
            `${system.name} when ${trigger.condition.state.toString()} is ${trigger.condition.value}`,
          );
          return;
        }

        if (trigger.condition.type === "on") {
          console.log(
            `${system.name} on ${trigger.condition.state.toString()} ${trigger.condition.transition} ${trigger.condition.value}`,
          );
          return;
        }
      });
      console.groupEnd();
    });
}

export default DufusEngine;
