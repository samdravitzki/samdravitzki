import p5 from "p5";
import World from "../World/World";
import State from "../State/State";

/**
 * resource containing the position of the mouse on screen
 *
 * NOTE: Need to figure out how I can generalise the kind of shared resources so it doesn't have to
 * be rigidly typed as part of the System type. If the engine defines the resources as part
 * of the system type like it does here there is no way for the library consumer to define their
 * own resources
 */
export type MousePosition = {
  x: number;
  y: number;
};

/**
 * The main states of the applicaton
 *
 * NOTE: Similar to resources states should be defined by the consumer of the
 * Engine and so they should be configurable and customised by the user.
 * ApplicationState likely only makes sense in the scenario of this pong
 * example
 */
export type ApplicationState = "paused" | "main-menu" | "in-game";

/**
 * An ECS system, create systems to implement behaviour on the ECS world
 *
 * NOTE: I don't intend p5 to be available as a resource because I dont want this tool to be
 * coupled to p5. It is added as a resource so that I can the p5 ui features directly as a short term solution
 * so that dont have to create a ui abstraction based on entities and components just yet
 *
 * IDEA: It would be useful to have access to the bounds as a resource to help with positioning
 *
 * GOAL: pull this back to a simple interface not dependent on any third party depedencies and make
 * resources and state customisable by user with some default resources
 */
type System = (
  world: World,
  resources: { mousePosition: MousePosition; p: p5 },
  state: { appState: State<ApplicationState>; renderTrajectory: State<boolean> }
) => void;

export default System;
