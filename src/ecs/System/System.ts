import p5 from 'p5';
import World from '../World/World';

/**
 * resource containing the position of the mouse on screen
 * 
 * NOTE: Need to figure out how I can generalise the kind of shared resources so it doesn't have to
 * be rigidly typed as part of the System type. If the engine defines the resources as part 
 * of the system type like it does here there is no way for the library consumer to define their 
 * own resources
 */
export type MousePosition = {
    x: number,
    y: number,
}

/**
 * An ECS system, create systems to implement behaviour on the ECS world
 * 
 * NOTE: Ideally p5 shouldn't be available as a resource because that way it will be
 * easier to move away from in the future. It is added as a resource so that I can directly
 * use its ui features without requiring an abstraction to save a bit of time. Another benefit
 * is that rendering and other things that rely on p5 can be factored out to systems
 */
type System = (world: World, resources: { mousePosition: MousePosition, p: p5 }) => void;

export default System;
