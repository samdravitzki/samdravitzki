import State from "../State/State";
import System from "../System/System";
import World from "../World/World";

// TODO: remove this duplication
type States<StateSet extends Record<string, unknown> = {}> = {
  [Key in keyof StateSet]: State<StateSet[Key]>;
};

type EngineContext<StateSet> = {
  world: World;
  states: StateSet;
  resources: Map<string, unknown>;
};

/**
 * A schedule describes how a collection systems should run based on
 * on the context of the engine. Where depending on various properties
 * of the engine such as state, event data whether a system should
 * be run and in what order
 *
 * Example uses could include...
 * - only run a system on start
 * - on each frame
 * - on each physics update
 * - only after another system runs
 * - only when entering a particualar state
 * - and more
 *
 * Heavily based on the concept of Schedules from bevy
 * https://bevy-cheatbook.github.io/programming/schedules.html
 *
 * At least for now the main difference between the Schedules in this
 * library and bevy is that this doesn't actually run the systems, it only
 * describes the order in which the systems should run (although this may
 * change)
 */
interface Scheduler<StateSet extends Record<string, unknown>> {
  // research to bookmark https://news.ycombinator.com/item?id=4672380
  schedule(context: EngineContext<StateSet>): System<States<StateSet>>[];
}

class UpdateScheduler<StateSet extends Record<string, unknown>>
  implements Scheduler<StateSet>
{
  constructor(
    private readonly _systems: [{ event: string }, System<States<StateSet>>][]
  ) {}

  schedule(context: EngineContext<StateSet>): System<States<StateSet>>[] {

    
  }
}

export default Scheduler;
