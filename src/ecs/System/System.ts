import World from '../World/World';

// Need to figure out how I can generalise the kind of shared resources so it doesn't have to
// be rigidly typed as part of the System type. If the engine defines the resources as part 
// of the system type like it does here there is no way for the library consumer to define their 
// own resources
export type MousePosition = {
    x: number,
    y: number,
}

type System = (world: World, resources: { mousePosition: MousePosition }) => void;

export default System;
