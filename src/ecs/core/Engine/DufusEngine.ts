import State from "../State/State";
import System, { Dispose } from "../System/System";
import World from "../World/World";
import EventDipatcher from "./EventDipatcher";
import { Engine } from "./Engine";
import { ResourcePool } from "./ResourcePool";
import { Part } from "../Part/Part";
import { Trigger } from "../Trigger/Trigger";
import { createTriggerBuilder } from "../Trigger/TriggerBuilder";

type States<StateMap extends Record<string, unknown> = {}> = {
  [Key in keyof StateMap]: State<StateMap[Key]>;
};

type SystemRegistration<
  EventMap extends Record<string, unknown>,
  StateMap extends Record<string, unknown>,
  EventKey extends keyof EventMap,
> = {
  name: string;
  system: System<EventMap, StateMap, EventKey>;
  trigger: Trigger<EventMap, StateMap, EventKey>;
};

/**
 * Designed based bevy ecs app builder api https://bevy-cheatbook.github.io/programming/app-builder.html
 */
class DufusEngine<
  EventMap extends Record<string, unknown> & { init: void } = {
    init: void;
  },
  StateMap extends Record<string, unknown> = {},
> implements Engine<EventMap, StateMap> {
  private _eventDispatcher = new EventDipatcher<EventMap>();
  private _store: States<StateMap>;
  /**
   * Number of times a state change a system is dependent on has occured
   * Needed so that when the event the system is dependent on triggers it can determine wheter it should run
   */
  private _stateChangeTracker = new Map<Function, number>();
  private _world = new World();
  private _resources = new ResourcePool();
  private _systems: SystemRegistration<EventMap, StateMap, keyof EventMap>[] =
    [];
  private _cleanup: Dispose[] = [];

  constructor(stateMap: StateMap) {
    this._store = Object.keys(stateMap).reduce((prev, next) => {
      return {
        ...prev,
        [next]: new State(stateMap[next]),
      };
    }, {}) as States<StateMap>;
  }

  private _executeSystem<Event extends keyof EventMap>(
    system: System<EventMap, StateMap, Event>,
    eventPayload: EventMap[Event],
  ) {
    const cleanupFn = system(
      this._world,
      this._resources,
      this._store,
      {
        emit: ({ event: emittedEvent, payload }) =>
          // Would like to figure out why this type assertion is needed, and how it could be avoided
          this._eventDispatcher.publish(
            emittedEvent as Event,
            payload as EventMap[Event],
          ),
      },
      eventPayload,
    );

    // This approach will result in a memory leak if system triggered on update events require cleanup. Will need to look into different approach when this becomes a problem
    if (cleanupFn) {
      this._cleanup.push(cleanupFn);
    }
  }

  system<Event extends keyof EventMap>(
    name: string, // Remove this name field - no longer used
    trigger: Trigger<EventMap, StateMap, Event>,
    s: System<EventMap, StateMap, Event>,
  ): void {
    const { condition, event } = trigger;

    this._systems.push({
      name,
      system: s as System<EventMap, StateMap, keyof EventMap>,
      trigger,
    });

    if (!condition) {
      this._eventDispatcher.subscribe(event, (payload) =>
        this._executeSystem(s, payload),
      );
      return;
    }

    if (condition.type === "when") {
      this._eventDispatcher.subscribe(event, (payload) => {
        if (this._store[condition.state].value === condition.value) {
          this._executeSystem(s, payload);
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
      this._eventDispatcher.subscribe(event, (payload) => {
        const trackedTransitionCount = this._stateChangeTracker.get(s);
        if (trackedTransitionCount && trackedTransitionCount > 0) {
          this._executeSystem(s, payload);
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
          trigger as Trigger<EventMap, StateMap, keyof EventMap>,
          sys as unknown as System<EventMap, StateMap, keyof EventMap>,
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
        console.debug(`(state) ${name} is ${to} (was ${from})`),
      );
    });

    // Problem: Run can currently be called many times, resulting in multiple 'init' events
    // Probably should either block this, or reset the world and state when a new init event is triggered
    this._eventDispatcher.publish("init", undefined);
  }

  stop() {
    this._cleanup.forEach((cleanup) => cleanup());
    console.log("Stopped");
  }
}

type EventSystemMap<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
> = Record<
  keyof EventMap,
  SystemRegistration<EventMap, StateMap, keyof EventMap>[]
>;

function groupSystemsByEvent<
  EventMap extends Record<string, unknown> = {},
  StateMap extends Record<string, unknown> = {},
>(
  systemRegistrations: SystemRegistration<EventMap, StateMap, keyof EventMap>[],
) {
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
>(
  systemRegistrations: SystemRegistration<EventMap, StateMap, keyof EventMap>[],
) {
  const systemEventGroups = groupSystemsByEvent(systemRegistrations);

  Object.keys(systemEventGroups)
    .sort()
    .map((event) => {
      console.group(`${event} event`);
      systemEventGroups[event].map(({ trigger, name }) => {
        if (!trigger.condition) {
          console.log(name);
          return;
        }

        if (trigger.condition.type === "when") {
          console.log(
            `${name} when ${trigger.condition.state.toString()} is ${trigger.condition.value}`,
          );
          return;
        }

        if (trigger.condition.type === "on") {
          console.log(
            `${name} on ${trigger.condition.state.toString()} ${trigger.condition.transition} ${trigger.condition.value}`,
          );
          return;
        }
      });
      console.groupEnd();
    });
}

export default DufusEngine;
