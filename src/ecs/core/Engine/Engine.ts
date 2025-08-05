import p5 from "p5";
import System from "../System/System";
import World from "../World/World";
import Bounds from "../Bounds/Bounds";
import State from "../State/State";
import { ResourcePool } from "./ResourcePool";

export type EngineOptions = Partial<{
  canvasBounds: Bounds;
}>;

type States<StateSet extends Record<string, unknown> = {}> = {
  [Key in keyof StateSet]: State<StateSet[Key]>;
};

type Cleanup = () => void;

type Runner<StateSet extends Record<string, unknown>> = (
  systems: [{ event: string }, System<States<StateSet>>][],
  world: World,
  resources: ResourcePool,
  state: States<StateSet>
) => void | Cleanup;

/**
 * A part is a set of functionality that you can use to
 * encapsualte engine configuration
 */
type EnginePart<StateSet extends Record<string, unknown>> = (
  engine: Engine<StateSet>
) => void;

/**
 * Designed based bevy ecs app builder api https://bevy-cheatbook.github.io/programming/app-builder.html
 */
export class Engine<StateSet extends Record<string, unknown> = {}> {
  private _states: States<StateSet>;
  private _systems: [{ event: string }, System<States<StateSet>>][] = [];
  private _world = new World();
  private _resources = new ResourcePool();

  private _runner?: Runner<StateSet>;

  private _cleanupSteps: Cleanup[] = [];

  constructor(stateSet: StateSet, options: EngineOptions = {}) {
    this._states = Object.keys(stateSet).reduce((prev, next) => {
      return {
        ...prev,
        [next]: new State(stateSet[next]),
      };
    }, {}) as States<StateSet>;
  }

  system(
    name: string,
    trigger: { event: string },
    system: System<States<StateSet>>
  ): void {
    this._systems.push([{ event: trigger.event }, system]);
  }

  /**
   * A runner is responsible for taking the set of systems defined in the
   * engine and executing them based on the triggers associated with each system
   *
   * An engine can only have a single runner
   */
  runner(runner: Runner<StateSet>) {
    this._runner = runner;
  }

  part(part: EnginePart<StateSet>) {
    part(this);
  }

  /**
   * Renders and runs the game within a HTML canvas element
   * @param parent optionally supply the parent element to render visuals within
   */
  run() {
    if (!this._runner) {
      console.error("Engine has no runner configured");
      return;
    }

    console.debug(this._systems);

    // The runner should only be responsible for running
    // the systems and not choosing whether or not they should run
    const cleanup = this._runner(
      this._systems,
      this._world,
      this._resources,
      this._states
    );

    if (cleanup) {
      this._cleanupSteps.push(cleanup);
    }
  }

  stop() {
    this._cleanupSteps.forEach((cleanup) => cleanup());
    console.debug("Stopped");
  }
}

export default Engine;
