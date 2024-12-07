import { EngineBuilder } from "./Engine";
import collisionEnginePart from "./collision/collision-handling-part";
import menuUiPart from "./setup-ui";

/**
 * The main states of the applicaton
 */
type ApplicationState = "paused" | "main-menu" | "in-game" | "end";

const engine = EngineBuilder.create()
  .state("render-trajectory", false)
  .state<"score", [number, number]>("score", [0, 0])
  .state<"app-state", ApplicationState>("app-state", "main-menu")
  .build(document.getElementById("pong-sketch")!);

engine.part(collisionEnginePart());
engine.part(menuUiPart)

export default engine;
export type { ApplicationState };
