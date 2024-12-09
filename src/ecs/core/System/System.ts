import p5 from "p5";
import World from "../World/World";
import State from "../State/State";
import Bounds from "../Bounds/Bounds";

/**
 * Resource describing the position of the mouse on screen
 */
export type MousePosition = {
  x: number;
  y: number;
};

/**
 * Resources are global state shared between systems that is not associated with any
 * entity in particular
 *
 * Resources add the flexibility to break out of the ecs pattern adding
 * the ability to implement solutions in different ways that may be more
 * appropiate to solve the problem at hand
 *
 * Examples of this type of state could be score or the current key pressed
 *
 * NOTES: For now this is just a hardcoded list of data defined in the system type and populated
 * at runtime by the engine but ultimately I want the resources to define a bunch
 * of useful data and utilities for the user of the engine and allow the user to define their
 * own resources
 *
 * NOTE: I don't intend p5 to be available as a default engine resource because I dont want this tool to be
 * coupled to p5 in the long run. It is added as a resource so that I can the p5 ui features directly as a
 * short term solution so that dont have to create a ui abstraction based on entities and components just yet
 *
 * NOTE: Need to figure out how I can generalise the kind of shared resources so it doesn't have to
 * be rigidly typed as part of the System type. If the engine defines the resources as part
 * of the system type like it does here there is no way for the library consumer to define their
 * own resources
 *
 * GOAL: pull this back to a simple interface not dependent on any third party depedencies and make
 * resources and state customisable by user with some default resources
 *
 * Reference
 * - https://bevy-cheatbook.github.io/programming/res.html
 * - https://www.gamedev.net/forums/topic/710271-where-should-shared-resources-live-in-an-ecs-engine/
 */
type Resources = {
  p: p5;
  mousePosition: MousePosition;
  canvasBounds: Bounds;
};

/**
 * An ECS system, create systems to implement behaviour on the ECS world
 */
type System<StateSet extends Record<string, State<unknown>>> = (
  world: World,
  resources: Resources,
  state: StateSet
) => void;

export default System;
