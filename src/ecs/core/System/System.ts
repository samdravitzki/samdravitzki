import World from "../World/World";

import State from "../State/State";
import { ResourcePool } from "../Engine/ResourcePool";

/**
 * An ECS system, create systems to implement behaviour on the ECS world
 */
type System<StateSet extends Record<string, State<unknown>>> = (
  world: World,
  resources: ResourcePool,
  state: StateSet
) => void;

export default System;
