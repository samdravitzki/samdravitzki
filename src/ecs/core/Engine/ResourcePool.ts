/**
 * Resources are global state shared between systems that is not associated with any
 * entity in particular
 *
 * Resources add the flexibility to break out of the ecs pattern adding
 * the ability to implement solutions in different ways that may be more
 * appropiate to solve the problem at hand
 *
 * Unlike state, resources aren't typesafe and can be dynamically added by systems ad runtime. Some systems
 * only purpose may be to setup resources for others to use downstream.
 *
 * Examples of a resource would be external libraries or what key is currently pressed
 *
 * NOTES: I dont like how unsafe typewise this approach is currently because even if you know the key that
 * relates to the resource you could pass in the wrong generic type causing defects. I was chatting to chatgpt
 * and it recommended rather than using strings to use constructors instead. I like this because it means
 * rather than using a string as the key and generics to define the type returned the constructor could both
 * be used as a key and to infer the resulting type. The only downsiode
 *
 * Reference
 * - https://bevy-cheatbook.github.io/programming/res.html
 * - https://www.gamedev.net/forums/topic/710271-where-should-shared-resources-live-in-an-ecs-engine/
 */

export class ResourcePool {
  private _pool = new Map<string, unknown>();

  set(name: string, value: unknown) {
    this._pool.set(name, value);
  }

  get<T>(name: string): T {
    const resource = this._pool.get(name);

    if (!resource) {
      throw new Error(`Resource with name ${name} does not exist`);
    }

    return this._pool.get(name) as T;
  }
}
