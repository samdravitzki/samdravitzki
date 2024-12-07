import { EngineBuilder } from "./Engine";
import collisionEnginePart from "./collision/collision-handling-part";
import setupBallPart from "./setup/setup-ball";
import setupBoundariesPart from "./setup/setup-boundaries";
import setupPaddlesPart from "./setup/setup-paddles";
import setupScoreboardPart from "./setup/setup-scoreboard";
import setupMenuUiPart from "./setup/setup-ui";

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
engine.part(setupMenuUiPart);
engine.part(setupBallPart);
engine.part(setupScoreboardPart);
engine.part(setupBoundariesPart);
engine.part(setupPaddlesPart);

export default engine;
export type { ApplicationState };
