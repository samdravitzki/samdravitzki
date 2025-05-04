import World from "../World/World";
/**
 * A schedule describes how a collection systems should run based on
 * a definition supplied by the user. Enables the user to supply a set
 * of rules used to determine when and if the system should run.
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
  // Idea:
  // Maybe if I have schedules also be responsible for calling the services I could create a specific
  // implementation of the schedule for p5 that can then switch out for a custom implementation
  // this would also allow us to decouple p5 from the engine in relation to running systems.
  // if we also do this for rendering p5 will be entirely decoupled
  schedule(
    world: World,
    states: StateSet,
    resources: Map<string, unknown>
  ): void;

  add(child: Scheduler<StateSet>): void;
}

class CompositeScheduler<StateSet extends Record<string, unknown>>
  implements Scheduler<StateSet>
{
  private _children: Scheduler<StateSet>[] = [];

  add(child: Scheduler<StateSet>) {
    this._children.push(child);
  }

  schedule(
    world: World,
    states: StateSet,
    resources: Map<string, unknown>
  ): void {
    this._children.forEach((child) => {
      child.schedule(world, states, resources);
    });
  }
}

// class SystemScheduler ?

// class EventScheduler implements Scheduler {}

// class StateChangeScheduler<StateSet extends Record<string, unknown>>
//   implements Scheduler<StateSet> {}

export default Scheduler;
