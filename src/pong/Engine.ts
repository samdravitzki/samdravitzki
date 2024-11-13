import p5 from "p5";
import System, { MousePosition } from "../ecs/System/System";
import World from "../ecs/World/World";
import Bounds from "../Bounds/Bounds";
import Vector from "../Vector/Vector";
import State from "../ecs/State/State";

/**
 * Resources:
 *
 * Global state shared between systems that is not associated with any
 * entity in particular
 *
 * Resources add the flexibility to break out of the ecs pattern adding
 * the ability to implement solutions in different ways that may be more
 * appropiate to solve the problem at hand
 *
 * Examples of this type of state could be score or the current key pressed
 *
 * Reference
 * - https://bevy-cheatbook.github.io/programming/res.html
 * - https://www.gamedev.net/forums/topic/710271-where-should-shared-resources-live-in-an-ecs-engine/
 */
// type Resource = {

// }

/**
 * Conditional Systems:
 *
 * Implementations of ECS all seem to eventually need a way to orchestrate in what situations
 * systems will run. Both Unity and Bevy implement a mechanism for doing this with Unitys being
 * Component System Groups and Bevys being States
 *
 * Reference
 * - https://docs.unity3d.com/Packages/com.unity.entities@1.0/manual/systems-update-order.html
 * - https://github.com/bevyengine/bevy/blob/main/examples/games/game_menu.rs
 *
 * Currently I am running into an issue where I want the game to have a pause menu and a main menu,
 * but in each menu you want different systems to run and others to stop. It looks like I will need
 * to introduce a similiar concept to orchestrate functions into this codebase to introduce menus.
 * The goal is I should end up with something that can stop the game systems when opening the pause
 * menu, trigger some systems to run to setup the menu and run systems while the menu is open. Then
 * when the menu is closed a set of systems runs to close the menu and unpause. This should also
 * be generalised so that it can be applied to other scenarios in which I want to conditionally run
 * systems
 *
 * These states could be modeled in a simlar way to how they are in react?
 *
 * An alternative approach to conditional systems is to have multiple worlds and conditions for determining
 * which world is available to the user. The issue for me with this tho is it is almost exactly the same
 * as doing conditional systems except for if you can't have the same systems that run no matter whether
 * the game is paused or not meaning its just seems less flexible
 */

type EngineLifecycleEvent = "start" | "update";

type SystemRegistration<StateSet extends Record<string, State<unknown>> = {}> =
  {
    system: System<StateSet>;
    // run system depending on the application state, if non specified run always
    runCondition: RunCondition;
  };

// TODO:  Run condition should be able to support any state, this needs to be genera
type ApplicationState = "paused" | "main-menu" | "in-game";
type RunCondition = {
  event: EngineLifecycleEvent;
  state?: string;
  value?: ApplicationState; // This should not be tied to any particular state
  trigger?: "on-enter" | "on-exit"; // When triggers is excluded its run every frame
};

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
class EngineBuilder<StateSet extends Record<string, State<unknown>> = {}> {
  private constructor(private readonly stateSet: StateSet) {}

  /**
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
    const newState = { [name]: new State<T>(value) };

    return new EngineBuilder<StateSet & { [k in K]: State<T> }>({
      ...this.stateSet,
      ...newState,
    });
  }

  build(element: HTMLElement) {
    return new Engine(element, this.stateSet);
  }

  static create(): EngineBuilder {
    return new EngineBuilder({});
  }
}

/**
 * Designed based bevy ecs app builder api https://bevy-cheatbook.github.io/programming/app-builder.html
 */
class Engine<StateSet extends Record<string, State<unknown>> = {}> {
  private _world = new World();
  private _systems = new Map<
    EngineLifecycleEvent,
    SystemRegistration<StateSet>[]
  >();

  private _element: HTMLElement;

  private _stateSet: StateSet;

  constructor(element: HTMLElement, stateSet: StateSet) {
    this._element = element;
    this._stateSet = stateSet;
  }

  system(condition: RunCondition, system: System<StateSet>) {
    const eventSystems = this._systems.get(condition.event);

    const systemRegistration = {
      system,
      runCondition: condition,
    };

    if (!eventSystems) {
      this._systems.set(condition.event, [systemRegistration]);
    } else {
      eventSystems.push(systemRegistration);
    }
  }

  // TODO: Remove this system and replace uses with the above method
  addSystem(
    condition: RunCondition,
    system: System<StateSet>
  ): Engine<StateSet> {
    const eventSystems = this._systems.get(condition.event);

    const systemRegistration = {
      system,
      runCondition: condition,
    };

    if (!eventSystems) {
      this._systems.set(condition.event, [systemRegistration]);
    } else {
      eventSystems.push(systemRegistration);
    }

    return this;
  }

  addSystems(
    condition: RunCondition,
    systems: System<StateSet>[]
  ): Engine<StateSet> {
    systems.forEach((system) => {
      this.addSystem(condition, system);
    });

    return this;
  }

  run() {
    // Have to rescope this because the p5 callback hs its own this
    const self = this;

    new p5((sketch) => {
      const p = sketch as unknown as p5;
      const playBounds = Bounds.create(
        Vector.create(0, 0),
        Vector.create(500, 250)
      );

      p.setup = function setup() {
        p.createCanvas(...playBounds.size);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noStroke();
        p.rectMode(p.CENTER);

        const mousePosition: MousePosition = {
          x: 0,
          y: 0,
        };

        const eventTriggeredSystems = self._systems
          .get("update")
          ?.filter((reg) => reg.runCondition?.trigger !== undefined);

        if (eventTriggeredSystems !== undefined) {
          eventTriggeredSystems?.forEach(({ system, runCondition }) => {
            if (
              runCondition?.trigger === undefined ||
              runCondition.state === undefined ||
              runCondition.value === undefined
            ) {
              return;
            }

            const state = self._stateSet[runCondition.state];
            // Not sure but the mouse position passed to this system might be out of date
            state.registerListener(
              runCondition.value,
              runCondition.trigger,
              () => system(self._world, { mousePosition, p }, self._stateSet)
            );
          });
        }

        const startSystems = self._systems.get("start") ?? [];

        startSystems.forEach(({ system }) =>
          system(self._world, { mousePosition, p }, self._stateSet)
        );
      };

      p.draw = function draw() {
        p.background(240, 90, 60);

        const updateSystems = self._systems.get("update") ?? [];

        const mousePosition: MousePosition = {
          x: p.mouseX,
          y: p.mouseY,
        };

        updateSystems.forEach(({ system, runCondition }) => {
          if (runCondition.value === undefined) {
            system(self._world, { mousePosition, p }, self._stateSet);
          }

          if (!runCondition.state) {
            return;
          }

          const state = self._stateSet[runCondition.state];

          if (
            runCondition.value === state?.value &&
            runCondition.trigger === undefined
          ) {
            system(self._world, { mousePosition, p }, self._stateSet);
          }
        });
      };
    }, this._element);
  }
}

export default Engine;
export { EngineBuilder };
