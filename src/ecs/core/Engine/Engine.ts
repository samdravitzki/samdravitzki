import p5 from "p5";
import System, { MousePosition } from "../System/System";
import World from "../World/World";
import Bounds from "../Bounds/Bounds";
import Vector from "../Vector/Vector";
import State from "../State/State";

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
class EngineBuilder<StateSet extends Record<string, unknown> = {}> {
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
    const newState = { [name]: value };

    return new EngineBuilder<StateSet & { [k in K]: T }>({
      ...this.stateSet,
      ...newState,
    });
  }

  build(options: EngineOptions = {}) {
    return new Engine(this.stateSet, options);
  }

  static create(): EngineBuilder {
    return new EngineBuilder({});
  }
}

type EngineOptions = Partial<{
  canvasBounds: Bounds;
}>;

const updateEvents = ["before-update", "update", "after-update"] as const;
type UpdateEvents = (typeof updateEvents)[number];

type StartEvent = "start";
type KeyPressEvent = "keypress";

type EngineLifecycleEvents = StartEvent | KeyPressEvent | UpdateEvents;

type SystemTrigger<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
> =
  | { event: StartEvent }
  | { event: KeyPressEvent }
  | {
      event: UpdateEvents;
      readonly condition?: {
        state: K;
        value: StateSet[K];
        // only trigger system on change to state (either on-enter or on-exit)
        only?: "on-enter" | "on-exit";
      };
    };

type SystemRegistration<
  StateSet extends Record<string, unknown>,
  K extends keyof StateSet,
> = {
  name: string;
  system: System<States<StateSet>>;
  // run system depending on the application state, if non specified run always
  trigger: SystemTrigger<StateSet, K>;
};

type States<StateSet extends Record<string, unknown> = {}> = {
  [Key in keyof StateSet]: State<StateSet[Key]>;
};

/**
 * Designed based bevy ecs app builder api https://bevy-cheatbook.github.io/programming/app-builder.html
 */
class Engine<StateSet extends Record<string, unknown> = {}> {
  private p5Instance?: p5;
  private _systems = new Map<
    EngineLifecycleEvents,
    SystemRegistration<StateSet, keyof StateSet>[]
  >();

  private _states: States<StateSet>;

  private _canvasBounds: Bounds;

  constructor(stateSet: StateSet, options: EngineOptions = {}) {
    this._states = Object.keys(stateSet).reduce((prev, next) => {
      return {
        ...prev,
        [next]: new State(stateSet[next]),
      };
    }, {}) as States<StateSet>;

    this._canvasBounds =
      options.canvasBounds ??
      Bounds.create(Vector.create(0, 0), Vector.create(500, 500));
  }

  system<K extends keyof StateSet>(
    name: string,
    trigger: SystemTrigger<StateSet, K>,
    system: System<States<StateSet>>
  ): void {
    const systemRegistration = {
      name,
      system,
      trigger,
    };

    const eventSystems = this._systems.get(trigger.event);

    if (!eventSystems) {
      this._systems.set(trigger.event, [systemRegistration]);
    } else {
      eventSystems.push(systemRegistration);
    }
  }

  part(part: (engine: Engine<StateSet>) => void) {
    part(this);
  }

  /**
   * Renders and runs the game within a HTML canvas element
   * @param parent optionally supply the parent element to render the canvas element within
   */
  run(parent?: HTMLElement) {
    console.debug("Starting...");
    // Have to rescope this because the p5 callback hs its own this
    const self = this;

    const world = new World();

    // This is a p5 instance https://p5js.org/reference/p5/p5/
    this.p5Instance = new p5((sketch) => {
      const p = sketch as unknown as p5;
      p.setup = function setup() {
        p.createCanvas(...self._canvasBounds.size);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noStroke();
        p.rectMode(p.CENTER);

        const mousePosition: MousePosition = {
          x: 0,
          y: 0,
        };

        const startSystems = self._systems.get("start") ?? [];
        startSystems.forEach(({ name, system }) => {
          console.debug(`[start] ${name}`);
          system(
            world,
            { mousePosition, p, canvasBounds: self._canvasBounds },
            self._states
          );
        });

        const stateChangeTriggeredSystems = self._systems.get("update");

        if (stateChangeTriggeredSystems !== undefined) {
          stateChangeTriggeredSystems.forEach(({ name, system, trigger }) => {
            if (
              trigger.event === "update" &&
              trigger.condition !== undefined &&
              trigger.condition.only !== undefined
            ) {
              const state = self._states[trigger.condition.state];
              state.registerListener(
                trigger.condition.value,
                trigger.condition.only,
                () => {
                  console.info(
                    `[event] ${trigger.condition!.only} ${trigger.condition!.state.toString()} ${name}`
                  );
                  system(
                    world,
                    { mousePosition, p, canvasBounds: self._canvasBounds },
                    self._states
                  );
                }
              );
            }
          });
        }
      };

      p.draw = function draw() {
        p.background(240, 90, 60);

        const beforeUpdateSystems = self._systems.get("before-update") ?? [];
        const updateSystems = self._systems.get("update") ?? [];
        const afterUpdateSystems = self._systems.get("after-update") ?? [];

        const systems = [
          ...beforeUpdateSystems,
          ...updateSystems,
          ...afterUpdateSystems,
        ];

        const mousePosition: MousePosition = {
          x: p.mouseX,
          y: p.mouseY,
        };

        systems.forEach(({ name, system, trigger }) => {
          if (
            trigger.event === "update" ||
            trigger.event === "before-update" ||
            trigger.event === "after-update"
          ) {
            if (trigger.condition === undefined) {
              system(
                world,
                { mousePosition, p, canvasBounds: self._canvasBounds },
                self._states
              );
            }

            if (
              trigger.condition !== undefined &&
              trigger.condition.only === undefined
            ) {
              const state = self._states[trigger.condition.state];

              if (trigger.condition.value === state.value) {
                // Is there a way to log what is happening each update without spamming too many logs
                console.debug(
                  `[when ${trigger.condition.state.toString()} = ${trigger.condition.value}] ${name}`
                );
                system(
                  world,
                  { mousePosition, p, canvasBounds: self._canvasBounds },
                  self._states
                );
              }
            }
          }
        });
      };

      p.keyPressed = function keyPressed() {
        const keypressSystems = self._systems.get("keypress") ?? [];

        const mousePosition: MousePosition = {
          x: p.mouseX,
          y: p.mouseY,
        };

        keypressSystems.forEach(({ name, system }) => {
          console.debug(`[keypress] ${name}`);
          system(
            world,
            { mousePosition, p, canvasBounds: self._canvasBounds },
            self._states
          );
        });
      };
    }, parent);
  }

  stop() {
    console.debug("Stopped");
    if (this.p5Instance !== undefined) {
      this.p5Instance.remove();
    }
  }
}

export default Engine;
export { EngineBuilder };
