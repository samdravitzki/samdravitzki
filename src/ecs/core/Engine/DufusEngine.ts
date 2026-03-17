import State from "../State/State";
import System, { Dispose } from "../System/System";
import World from "../World/World";
import EventBus from "./EventBus";
import { Engine } from "./Engine";
import { ResourcePool } from "./ResourcePool";
import { Part } from "../Part/Part";
import { Trigger } from "../Trigger/Trigger";
import { createTriggerBuilder } from "../Trigger/TriggerBuilder";

type States<StateMap extends Record<string, unknown> = {}> = {
  [Key in keyof StateMap]: State<StateMap[Key]>;
};

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
  EventMap extends Record<string, unknown> & { init: unknown } = {
    init: unknown;
  },
  StateMap extends Record<string, unknown> = {},
> implements Engine<EventMap, StateMap> {
  private _eventBus = new EventBus<EventMap>();
  private _store: States<StateMap>;
  /**
   * Number of times a state change a system is dependent on has occured
   * Needed so that when the event the system is dependent on triggers it can determine wheter it should run
   */
  private _stateChangeTracker = new Map<System<EventMap, StateMap>, number>();
  private _world = new World();
  private _resources = new ResourcePool();
  private _systems: SystemRegistration<EventMap, StateMap>[] = [];
  private _cleanup: Dispose[] = [];

  constructor(stateMap: StateMap) {
    this._store = Object.keys(stateMap).reduce((prev, next) => {
      return {
        ...prev,
        [next]: new State(stateMap[next]),
      };
    }, {}) as States<StateMap>;
  }

  private _executeSystem(system: System<EventMap, StateMap>) {
    const cleanupFn = system(this._world, this._resources, this._store, {
      emit: ({ event: emittedEvent }) =>
        // Would like to figure out why this type assertion is needed, and how it could be avoided
        this._eventBus.publish(emittedEvent as keyof EventMap),
    });

    // This approach will result in a memory leak if system triggered on update events require cleanup. Will need to look into different approach when this becomes a problem
    if (cleanupFn) {
      this._cleanup.push(cleanupFn);
    }
  }

  system(
    name: string, // Remove this name field - no longer used
    trigger: Trigger<EventMap, StateMap>,
    s: System<EventMap, StateMap>,
  ): void {
    const { condition, event } = trigger;

    this._systems.push({
      system: s,
      trigger,
    });

    if (!condition) {
      this._eventBus.subscribe(event, () => this._executeSystem(s));
      return;
    }

    if (condition.type === "when") {
      this._eventBus.subscribe(event, () => {
        if (this._store[condition.state].value === condition.value) {
          this._executeSystem(s);
        }
      });
      return;
    }

    if (condition.type === "on") {
      /**
       * Want to figure out how to test behaviour - state can be changed many times but the system will only run when the event occurs
       * Example test case:
       * 1. define system that triggers on state x on enter
       * 2. trigger event system is dependent on expecting it not to run
       * 3. change state to x
       * 4. trigger event system is dependent on expecting it to run
       *
       * The engine api dosen't allow triggering specific events making this scenario
       * impossible to test. To test it im thinking should factor out the system
       * execution logic to gain acess ot these controls and because it will split
       * up the responsibilities making it easier to understand, extend and change
       */
      this._eventBus.subscribe(event, () => {
        const trackedTransitionCount = this._stateChangeTracker.get(s);
        if (trackedTransitionCount && trackedTransitionCount > 0) {
          this._executeSystem(s);
          this._stateChangeTracker.set(s, 0);
        }
      });

      const state = this._store[condition.state];
      const transitionMap = {
        enter: "on-enter" as const,
        exit: "on-exit" as const,
      };

      state.onTransition(
        condition.value,
        transitionMap[condition.transition],
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

  /**
   * Starts the engine by triggering the "init" event
   */
  run() {
    logSystemRegistrations(this._systems);

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

  stop() {
    this._cleanup.forEach((cleanup) => cleanup());
    console.log("Stopped");
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
