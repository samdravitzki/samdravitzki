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
  private _systems: [{ event: string }, System<States<StateSet>>][] = [];
  private _states: States<StateSet>;
  private _world = new World();
  private _resources = new ResourcePool();

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

  part(part: EnginePart<StateSet>) {
    part(this);
  }

  /**
   * Renders and runs the game within a HTML canvas element
   * @param parent optionally supply the parent element to render visuals within
   */
  run() {}

  stop() {
    console.debug("Stopped");
  }
}

export default Engine;
