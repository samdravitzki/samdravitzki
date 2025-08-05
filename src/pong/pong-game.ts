import p5 from "p5";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import {
  Velocity,
  BallComponent,
  BackboardComponent,
  Speed,
  PaddleComponent,
  TrajectoryLineSegmentComponent,
} from "./components";
import { Collision } from "../ecs/parts/collision/components/Collision";
import { Position } from "../ecs/components/Position";
import { PrimitiveShape } from "../ecs/parts/p5/primitive-renderer/components/Primitive";
import castRay from "../ecs/parts/collision/cast-ray";
import createBundle from "../ecs/core/Bundle/createBundle";
import minionBongUrl from "./sounds/minion-bong.mp3";
import State from "../ecs/core/State/State";
import Component from "../ecs/core/Component/Component";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import collisions from "../ecs/parts/collision/collision";
import setupBallPart from "./setup/setup-ball";
import setupBoundariesPart from "./setup/setup-boundaries";
import setupPaddlesPart from "./setup/setup-paddles";
import setupScoreboardPart from "./setup/setup-scoreboard";
import setupMenuUiPart from "./setup/setup-ui";
import Bounds from "../ecs/core/Bounds/Bounds";
import {
  onEnter,
  onExit,
  onUpdate,
  onUpdateWhen,
} from "../ecs/core/Engine/SystemTrigger";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import p5Part, { MousePosition } from "../ecs/parts/p5/p5-part";
import Engine from "../ecs/core/Engine/Engine";

const ballHitAudio = new Audio(minionBongUrl);

const sound = false;

type Score = [number, number];

/**
 * The main states of the applicaton
 */
type ApplicationState = "paused" | "main-menu" | "in-game" | "end";

function showMainMenu(_world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");
  const mainMenu = p.select("#main-menu");
  mainMenu?.show();
}

function showGameMenu(_world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");
  const gameMenu = p.select("#game-menu");
  gameMenu?.show();
}

function hideGameMenu(_world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");
  const gameMenu = p.select("#game-menu");
  gameMenu?.hide();
}

function endConditionSystem(
  _world: World,
  {},
  state: { score: State<Score>; "app-state": State<ApplicationState> }
) {
  const [playerScore, aiScore] = state.score.value;

  if (playerScore >= 3 || aiScore >= 3) {
    state["app-state"].setValue("end");
  }
}

function showEndMenu(
  _world: World,
  resources: ResourcePool,
  state: { score: State<Score> }
) {
  const p = resources.get<p5>("p5");
  const [playerScore, aiScore] = state.score.value;

  console.log(`final score: player ${playerScore}, ai ${aiScore}`);

  const endMessageDiv = p.select("#end-menu > .message");

  if (endMessageDiv) {
    const winningMessage = "You won, Nice! 🔥";
    const loosingMessage = "You lost, to an ai 😔";
    endMessageDiv.html(`
      <p>${playerScore > aiScore ? winningMessage : loosingMessage}</p>
    `);
  }

  const endMenu = p.select("#end-menu");
  endMenu?.show();
}

function hideEndMenu(_world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");
  const endMenu = p.select("#end-menu");
  endMenu?.hide();
}

function hideMainMenu(_world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");
  const mainMenu = p.select("#main-menu");
  mainMenu?.hide();
}

function ballCollisionHandlingSystem(world: World) {
  for (const [velocity, collision, position] of world.query<
    [Velocity, Collision, Position, BallComponent]
  >(["velocity", "collision", "position", "ball"])) {
    const collidee = world.entity(collision.entityId);

    velocity.velocity = velocity.velocity.reflect(collision.normal);

    if (collidee.components.find((c) => c.name === "paddle")) {
      const paddlePosition = collidee.getComponent("position") as Position;

      const yDistanceFromPaddleCenter = paddlePosition.position.minus(
        position.position
      ).y;

      velocity.velocity = Vector.create(
        velocity.velocity.x,
        -yDistanceFromPaddleCenter / 25
      );
    }
  }
}

function backboardCollisionHandlingSystem(
  world: World,
  resources: ResourcePool,
  state: { score: State<Score> }
) {
  for (const [backboard] of world.query<[BackboardComponent, Collision]>([
    "backboard",
    "collision",
  ])) {
    const [ballPosition, ballVelocity, ballSpeed] = world.query<
      [Position, Velocity, Speed, BallComponent]
    >(["position", "velocity", "speed", "ball"])[0];

    // Reset ball position
    ballPosition.position = Vector.create(200, 40);

    const [playerScore, aiScore] = state.score.value;

    if (backboard.owner == "player") {
      state.score.setValue([playerScore, aiScore + 1]);
      // Reset ball directed towards player
      ballVelocity.velocity = ballVelocity.velocity = new Vector(
        -0.5,
        -0.5
      ).plus(new Vector(-0.1, -0.1).times(playerScore + aiScore));
    }

    if (backboard.owner == "ai") {
      state.score.setValue([playerScore + 1, aiScore]);

      // Reset ball directed towards ai
      ballVelocity.velocity = new Vector(0.5, -0.5).plus(
        new Vector(0.1, -0.1).times(playerScore + aiScore)
      );
    }

    // Reset ball speed
    ballSpeed.value = 3;
  }
}

function updateScoreBoard(
  world: World,
  resources: ResourcePool,
  state: { score: State<Score> }
) {
  const [playerScore, aiScore] = state.score.value;

  const [playerScoreText] = world.query<[PrimitiveShape]>([
    "primitive",
    "player-score",
  ])[0];

  // Its pretty weird the type has to be narrowed after you receive it from a query
  // Seems like the query should be responsible for this
  if (playerScoreText.type === "text") {
    playerScoreText.text = playerScore.toString();
  }

  const [aiScoreText] = world.query<[PrimitiveShape]>([
    "primitive",
    "ai-score",
  ])[0];

  if (aiScoreText.type === "text") {
    aiScoreText.text = aiScore.toString();
  }
}

// Describes bow the collision handling worked in the orginial pong game
// https://www.vbforums.com/showthread.php?634246-RESOLVED-How-did-collision-in-the-original-Pong-happen
function paddleCollisionHandlingSystem(world: World) {
  const [, ballSpeed] = world.query<[Velocity, Speed, BallComponent]>([
    "velocity",
    "speed",
    "ball",
  ])[0];

  for (const [collision] of world.query<[Collision, PaddleComponent]>([
    "collision",
    "paddle",
  ])) {
    if (
      world.entity(collision.entityId).components.find((c) => c.name === "ball")
    ) {
      ballSpeed.value += ballSpeed.value * 0.1;
    }

    if (sound) {
      ballHitAudio.play();
    }
  }
}

function playerPaddleSystem(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const mousePosition = resources.get<MousePosition>("mouse-position");

  for (const [position] of world.query<[Position]>([
    "position",
    "paddle",
    "player",
  ])) {
    const positionChange = mousePosition.y - position.position.y;
    position.position = position.position.plus(
      Vector.create(0, positionChange)
    );

    if (position.position.y < canvasBounds.min.y + 35) {
      position.position = Vector.create(
        position.position.x,
        canvasBounds.min.y + 35
      );
    }

    if (position.position.y > canvasBounds.max.y - 35) {
      position.position = Vector.create(
        position.position.x,
        canvasBounds.max.y - 35
      );
    }
  }
}

function aiPaddleSystem(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const [targetPosition] = world.query<[Position]>([
    "position",
    "ai-paddle-target",
  ])[0];
  for (const [position, speed] of world.query<[Position, Speed]>([
    "position",
    "speed",
    "paddle",
    "ai",
  ])) {
    // Cant just move it to where the ball is, need to move it to where the ball is going to be when it hits on the ai side
    position.position = position.position.plus(
      Vector.create(
        0,
        (targetPosition.position.y - position.position.y) * speed.value
      )
    );

    if (position.position.y < canvasBounds.min.y + 35) {
      position.position = Vector.create(
        position.position.x,
        canvasBounds.min.y + 35
      );
    }

    if (position.position.y > canvasBounds.max.y - 35) {
      position.position = Vector.create(
        position.position.x,
        canvasBounds.max.y - 35
      );
    }
  }
}

function ballMovementSystem(world: World) {
  const [velocity, position, speed] = world.query<
    [Velocity, Position, Speed, BallComponent]
  >(["velocity", "position", "speed", "ball"])[0];

  position.position = position.position.plus(
    velocity.velocity.times(speed.value)
  );
}

function ballTrajectorySystem(
  world: World,
  resources: ResourcePool,
  state: Record<string, State<unknown>>
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const renderTrajectory = state["render-trajectory"];
  const [targetPosition] = world.query<[Position]>([
    "position",
    "ai-paddle-target",
  ])[0];

  const [ballPosition, ballVelocity] = world.query<
    [Position, Velocity, BallComponent]
  >(["position", "velocity", "ball"])[0];

  for (const [entityId] of world.query<
    [string, TrajectoryLineSegmentComponent]
  >(["entity-id", "trajectory-line"])) {
    world.removeEntity(entityId);
  }

  const bounces = 20;
  let linesAdded = 0;

  // Start the ray a little back from the start of the center of the ball to mitigate issues with tunneling
  let start = ballPosition.position.minus(
    ballVelocity.velocity.normalised().times(10)
  );
  let direction = ballVelocity.velocity;

  // render trajectory line of each collision
  while (linesAdded < bounces) {
    const hit = castRay(
      world,
      {
        position: start,
        direction,
        length: canvasBounds.size[0] * 2,
      },
      { layer: "wall" }
    )[0];

    if (!hit) {
      break;
    }

    const end = hit.position;

    const trajectoryLineComponents: (string | Component)[] = [
      "trajectory-line",
      {
        name: "position",
        position: start,
      } as Position,
    ];

    if (renderTrajectory.value) {
      trajectoryLineComponents.push({
        name: "primitive",
        stroke: [240, 60, 100],
        dash: linesAdded === 0 ? 0 : [5, 5],
        strokeWeight: 2,
        type: "line",
        start: Vector.create(0, 0),
        end: end.minus(start),
      } as PrimitiveShape);
    }

    world.addBundle(createBundle(trajectoryLineComponents));

    const hitEntity = world.entity(hit.entityId);

    const backBoardComponent = hitEntity.components.find(
      (comp) => comp.name === "backboard"
    ) as BackboardComponent | undefined;

    if (backBoardComponent && backBoardComponent.owner === "ai") {
      targetPosition.position = hit.position;
      break;
    }

    start = end;
    direction = direction.reflect(hit.normal).normalised();

    linesAdded += 1;
  }
}

// NOTE for when back: Currently trying to get pong working with changes to how systems work
// Try improve design by removing parts and introducing self contained systems instead
class PongGameApp {
  private _engine?: Engine<any>;
  run(parent?: HTMLElement) {
    const pong = EngineBuilder.create()
      .state("render-trajectory", false)
      .state<"score", [number, number]>("score", [0, 0])
      .state<"app-state", ApplicationState>("app-state", "main-menu")
      .build();

    pong.part(p5Part([500, 500], parent));
    pong.part(collisions());
    pong.part(setupMenuUiPart);
    pong.part(setupBallPart);
    pong.part(setupScoreboardPart);
    pong.part(setupBoundariesPart);
    pong.part(setupPaddlesPart);

    pong.system(
      "showMainMenu",
      onEnter("app-state", "main-menu"),
      showMainMenu
    );
    pong.system("showGameMenu", onEnter("app-state", "in-game"), showGameMenu);
    pong.system(
      "hideGameMenu",
      onEnter("app-state", "main-menu"),
      hideGameMenu
    );
    pong.system("showEndMenu", onEnter("app-state", "end"), showEndMenu);
    pong.system("hideEndMenu", onExit("app-state", "end"), hideEndMenu);
    pong.system("hideMainMenu", onEnter("app-state", "in-game"), hideMainMenu);

    pong.system(
      "endConditionSystem",
      onUpdateWhen("app-state", "in-game"),
      endConditionSystem
    );
    pong.system(
      "ballCollisionHandlingSystem",
      onUpdateWhen("app-state", "in-game"),
      ballCollisionHandlingSystem
    );
    pong.system(
      "backboardCollisionHandlingSystem",
      onUpdateWhen("app-state", "in-game"),
      backboardCollisionHandlingSystem
    );
    pong.system("updateScoreBoard", onUpdate(), updateScoreBoard);
    pong.system(
      "paddleCollisionHandlingSystem",
      onUpdateWhen("app-state", "in-game"),
      paddleCollisionHandlingSystem
    );
    pong.system(
      "playerPaddleSystem",
      onUpdateWhen("app-state", "in-game"),
      playerPaddleSystem
    );
    pong.system(
      "aiPaddleSystem",
      onUpdateWhen("app-state", "in-game"),
      aiPaddleSystem
    );
    pong.system(
      "ballMovementSystem",
      onUpdateWhen("app-state", "in-game"),
      ballMovementSystem
    );
    pong.system(
      "ballTrajectorySystem",
      onUpdateWhen("app-state", "in-game"),
      ballTrajectorySystem
    );

    this._engine = pong;
    pong.run();
  }

  stop() {
    this._engine?.stop();
  }
}

export type { ApplicationState };
export default new PongGameApp();
