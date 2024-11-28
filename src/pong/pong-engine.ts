import { EngineBuilder } from "./Engine";

/**
 * The main states of the applicaton
 */
type ApplicationState = "paused" | "main-menu" | "in-game" | "end";

const engine = EngineBuilder.create()
  .state("render-trajectory", false)
  .state<"score", [number, number]>("score", [0, 0])
  .state<"app-state", ApplicationState>("app-state", "main-menu")
  .build(document.getElementById("pong-sketch")!);

export default engine;
export type { ApplicationState };
