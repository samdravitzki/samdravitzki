import { dufus } from "@dravitzki/dufus-engine";
import { collisions, CollisionContactEvent } from "@dravitzki/dufus-engine/parts/collisions";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import { KeypressEvent, p5Part } from "@dravitzki/dufus-engine/parts/p5";
import { ApplicationState } from "./common/types";
import { ballPart } from "./parts/ball";
import { gameplayPart } from "./parts/gameplay";
import { menuPart } from "./parts/menu";
import { paddlePart } from "./parts/paddle";
import { scenePart } from "./parts/scene";
import { trajectoryPart } from "./parts/trajectory";

export default function modularPong(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"collision", CollisionContactEvent>("collision")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .state("render-trajectory", false)
    .state<"score", [number, number]>("score", [0, 0])
    .state<"app-state", ApplicationState>("app-state", "main-menu")
    .build();

  engine.part(p5Part([500, 500], parent));
  engine.part(collisions());
  engine.part(inspector());
  engine.part(scenePart());
  engine.part(menuPart());
  engine.part(gameplayPart());
  engine.part(paddlePart());
  engine.part(ballPart());
  engine.part(trajectoryPart());

  return engine;
}
