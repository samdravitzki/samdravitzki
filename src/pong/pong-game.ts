import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import p5 from "p5";
import {
  Velocity,
  BallComponent,
  BackboardComponent,
  Speed,
  PaddleComponent,
  TrajectoryLineSegmentComponent,
} from "./components";
import { Position } from "../ecs/components/Position";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Text } from "../ecs/parts/p5/shape-components";
import { Line } from "../ecs/parts/p5/shape-components";
import castRay from "../ecs/parts/collision/cast-ray";
import createBundle from "../ecs/core/Bundle/createBundle";
import minionBongUrl from "./sounds/minion-bong.mp3";
import State from "../ecs/core/State/State";
import Component from "../ecs/core/Component/Component";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import collisions, {
  CollisionEventPayload,
} from "../ecs/parts/collision/collision";
import { createEndMenu, createGameMenu, createMainMenu } from "./setup-ui";
import Bounds from "../ecs/core/Bounds/Bounds";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import p5Part, { KeypressEvent, MousePosition } from "../ecs/parts/p5/p5-part";
import createBall from "./prefabs/ball";
import createBackboard from "./prefabs/backboard";
import createWall from "./prefabs/wall";
import createPaddle from "./prefabs/paddle";
import createScore from "./prefabs/score";

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
  state: { score: State<Score>; "app-state": State<ApplicationState> },
) {
  const [playerScore, aiScore] = state.score.value;

  if (playerScore >= 3 || aiScore >= 3) {
    state["app-state"].setValue("end");
  }
}

function showEndMenu(
  _world: World,
  resources: ResourcePool,
  state: { score: State<Score> },
) {
  const p = resources.get<p5>("p5");
  const [playerScore, aiScore] = state.score.value;

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

function ballCollisionHandlingSystem(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  collisionContact: CollisionEventPayload,
) {
  if (collisionContact.type !== "enter") {
    return;
  }

  const entityA = world.entity(collisionContact.entityA);
  const entityB = world.entity(collisionContact.entityB);

  const collisionEntities = [entityA, entityB];

  const ballEntity = collisionEntities.find((entity) =>
    entity.hasComponent("ball"),
  );

  const collideeEntity = collisionEntities.find(
    (entity) => entity !== ballEntity,
  )!;

  // If the collision is between a ball and anything else
  if (ballEntity) {
    const ballVelocity = ballEntity.getComponent("velocity") as Velocity;

    ballVelocity.velocity = ballVelocity.velocity.reflect(
      collisionContact.normal,
    );

    if (collideeEntity.hasComponent("paddle")) {
      const paddlePosition = collideeEntity.getComponent(
        "position",
      ) as Position;
      const ballPosition = ballEntity.getComponent("position") as Position;

      const yDistanceFromPaddleCenter = paddlePosition.position.minus(
        ballPosition.position,
      ).y;

      ballVelocity.velocity = Vector.create(
        ballVelocity.velocity.x,
        -yDistanceFromPaddleCenter / 25,
      );
    }
  }
}

function backboardCollisionHandlingSystem(
  world: World,
  resources: ResourcePool,
  state: { score: State<Score> },
  eventEmitter: unknown,
  collisionContact: CollisionEventPayload,
) {
  if (collisionContact.type !== "enter") {
    return;
  }

  /**
   * Idea: Match collision helper function
   * - pattern matching function that takes in the collision contact and
   *   two sets of components to match against, one for each entity in the collison.
   *
   * - If the collision contact matches the pattern it will return the two entities
   *   with the matched components, otherwise it will return undefined
   *
   * - Wild cards can be used to match against any component i.e. if there is only one
   *   entity involved in the collision in which we care about its component
   *
   * - This will align more with the pattern matching style of the query function on the world
   */
  const entityA = world.entity(collisionContact.entityA);
  const entityB = world.entity(collisionContact.entityB);

  const collisionEntities = [entityA, entityB];

  const ballEntity = collisionEntities.find((entity) =>
    entity.hasComponent("ball"),
  );

  const backboardEntity = collisionEntities.find((entity) =>
    entity.hasComponent("backboard"),
  );

  // If the collision is between a ball and a backboard
  if (ballEntity && backboardEntity) {
    const ballPosition = ballEntity.getComponent("position") as Position;
    const ballVelocity = ballEntity.getComponent("velocity") as Velocity;
    const ballSpeed = ballEntity.getComponent("speed") as Speed;
    ballPosition.position = Vector.create(200, 40);

    const [playerScore, aiScore] = state.score.value;

    const backboardComponent = backboardEntity.getComponent(
      "backboard",
    ) as BackboardComponent;

    if (backboardComponent.owner == "player") {
      state.score.setValue([playerScore, aiScore + 1]);
      // Reset ball directed towards player
      ballVelocity.velocity = new Vector(-0.5, -0.5).plus(
        new Vector(-0.1, -0.1).times(playerScore + aiScore),
      );
    }

    if (backboardComponent.owner == "ai") {
      state.score.setValue([playerScore + 1, aiScore]);

      // Reset ball directed towards ai
      ballVelocity.velocity = new Vector(0.5, -0.5).plus(
        new Vector(0.1, -0.1).times(playerScore + aiScore),
      );
    }

    ballSpeed.value = 3;
  }
}

function updateScoreBoard(
  world: World,
  resources: ResourcePool,
  state: { score: State<Score> },
) {
  const [playerScore, aiScore] = state.score.value;

  const [playerScoreText] = world.query<[Text]>(["text", "player-score"])[0];

  // Its pretty weird the type has to be narrowed after you receive it from a query
  // Seems like the query should be responsible for this
  playerScoreText.text = playerScore.toString();

  const [aiScoreText] = world.query<[Text]>(["text", "ai-score"])[0];

  aiScoreText.text = aiScore.toString();
}

// Describes bow the collision handling worked in the orginial pong game
// https://www.vbforums.com/showthread.php?634246-RESOLVED-How-did-collision-in-the-original-Pong-happen
function paddleCollisionHandlingSystem(
  world: World,
  resources: ResourcePool,
  state: unknown,
  eventEmitter: unknown,
  collisionContact: CollisionEventPayload,
) {
  if (collisionContact.type !== "enter") {
    return;
  }

  const entityA = world.entity(collisionContact.entityA);
  const entityB = world.entity(collisionContact.entityB);

  const collisionEntities = [entityA, entityB];

  const ballEntity = collisionEntities.find((entity) =>
    entity.hasComponent("ball"),
  );
  const paddleEntity = collisionEntities.find((entity) =>
    entity.hasComponent("paddle"),
  );

  // If the collision is between a ball and a paddle, increase the speed of the ball by 10%
  if (paddleEntity && ballEntity) {
    const ballSpeed = ballEntity.getComponent("speed") as Speed;
    ballSpeed.value += ballSpeed.value * 0.1;
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
      Vector.create(0, positionChange),
    );

    if (position.position.y < canvasBounds.min.y + 35) {
      position.position = Vector.create(
        position.position.x,
        canvasBounds.min.y + 35,
      );
    }

    if (position.position.y > canvasBounds.max.y - 35) {
      position.position = Vector.create(
        position.position.x,
        canvasBounds.max.y - 35,
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
        (targetPosition.position.y - position.position.y) * speed.value,
      ),
    );

    if (position.position.y < canvasBounds.min.y + 35) {
      position.position = Vector.create(
        position.position.x,
        canvasBounds.min.y + 35,
      );
    }

    if (position.position.y > canvasBounds.max.y - 35) {
      position.position = Vector.create(
        position.position.x,
        canvasBounds.max.y - 35,
      );
    }
  }
}

function ballMovementSystem(world: World) {
  const [velocity, position, speed] = world.query<
    [Velocity, Position, Speed, BallComponent]
  >(["velocity", "position", "speed", "ball"])[0];

  position.position = position.position.plus(
    velocity.velocity.times(speed.value),
  );
}

function ballTrajectorySystem(
  world: World,
  resources: ResourcePool,
  state: { "render-trajectory": State<boolean> },
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
    ballVelocity.velocity.normalised().times(10),
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
      { layer: "wall" },
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
        name: "line",
        start: Vector.create(0, 0),
        end: end.minus(start),
      } as Line);

      trajectoryLineComponents.push({
        name: "shape-style",
        stroke: [240, 60, 100],
        dash: linesAdded === 0 ? 0 : [5, 5],
        strokeWeight: 2,
      } as ShapeStyle);
    }

    world.addBundle(createBundle(trajectoryLineComponents));

    const hitEntity = world.entity(hit.entityId);

    const backBoardComponent = hitEntity.components.find(
      (comp) => comp.name === "backboard",
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

function setupSceneSystem(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const ballBundle = createBall(
    new Vector(canvasBounds.max.x / 2, canvasBounds.max.y / 2),
  );

  world.addBundle(ballBundle);

  const walllThickness = 10;
  const backboardThickness = 5;

  const northWallBundle = createWall(
    new Vector(
      canvasBounds.center.center.x,
      canvasBounds.min.y + walllThickness / 2,
    ),
    canvasBounds.max.x,
    walllThickness,
  );

  const southWallBundle = createWall(
    new Vector(
      canvasBounds.center.center.x,
      canvasBounds.max.y - walllThickness / 2,
    ),
    canvasBounds.max.x,
    walllThickness,
  );

  const centerLineBundle = createBundle([
    {
      name: "line",
      start: new Vector(0, -canvasBounds.center.center.y),
      end: new Vector(0, canvasBounds.center.center.y),
    } satisfies Line,
    {
      name: "shape-style",

      stroke: [240, 60, 100],
      strokeWeight: 2,
      fill: [240, 60, 100],
    } satisfies ShapeStyle,
    {
      name: "position",
      position: canvasBounds.center.center,
    } satisfies Position,
  ]);

  const leftBackboardBundle = createBackboard(
    new Vector(
      canvasBounds.min.x + backboardThickness / 2,
      canvasBounds.center.center.y,
    ),
    backboardThickness,
    canvasBounds.max.y - 25,
    "player",
  );

  const rightBackboardBundle = createBackboard(
    new Vector(
      canvasBounds.max.x - backboardThickness / 2,
      canvasBounds.center.center.y,
    ),
    backboardThickness,
    canvasBounds.max.y - 25,
    "ai",
  );

  world.addBundle(northWallBundle);
  world.addBundle(southWallBundle);
  world.addBundle(centerLineBundle);
  world.addBundle(leftBackboardBundle);
  world.addBundle(rightBackboardBundle);

  const paddleWallOffset = 10;

  const playerPaddleBundle = createPaddle(
    new Vector(canvasBounds.min.x + paddleWallOffset, canvasBounds.max.y / 2),
    "player",
  );

  // The position the ai paddle is aiming to end up in
  const aiPaddleTarget = createBundle([
    "ai-paddle-target",
    {
      name: "position",
      position: new Vector(0, 0),
    },
  ]);

  const aiPaddleBundle = createPaddle(
    new Vector(canvasBounds.max.x - paddleWallOffset, canvasBounds.max.y / 2),
    "ai",
  );
  world.addBundle(aiPaddleTarget);
  world.addBundle(playerPaddleBundle);
  world.addBundle(aiPaddleBundle);

  const scoreXOffset = 5;
  const scoreYOffset = 35;

  const playerScoreBundle = createScore(
    new Vector(
      canvasBounds.max.x / 2 - scoreXOffset,
      canvasBounds.min.y + scoreYOffset,
    ),
    "right",
    "player-score",
  );

  const aiScoreBundle = createScore(
    new Vector(
      canvasBounds.max.x / 2 + scoreXOffset,
      canvasBounds.min.y + scoreYOffset,
    ),
    "left",
    "ai-score",
  );

  world.addBundle(playerScoreBundle);
  world.addBundle(aiScoreBundle);
}

export default function pong(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"collision", CollisionEventPayload>("collision")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .state("render-trajectory", false)
    .state<"score", [number, number]>("score", [0, 0])
    .state<"app-state", ApplicationState>("app-state", "main-menu")
    .build();

  engine.part(p5Part([500, 500], parent));
  engine.part(collisions());

  engine.system("setup-scene", engine.trigger.on("setup"), setupSceneSystem);

  engine.system("createGameMenu", engine.trigger.on("setup"), createGameMenu);
  engine.system("createEndMenu", engine.trigger.on("setup"), createEndMenu);
  engine.system("createMainMenu", engine.trigger.on("setup"), createMainMenu);

  engine.system(
    "showMainMenu",
    engine.trigger.on("update").when("app-state").enters("main-menu"),
    showMainMenu,
  );
  engine.system(
    "showGameMenu",
    engine.trigger.on("update").when("app-state").enters("in-game"),
    showGameMenu,
  );
  engine.system(
    "hideGameMenu",
    engine.trigger.on("update").when("app-state").enters("end"),
    hideGameMenu,
  );
  engine.system(
    "showEndMenu",
    engine.trigger.on("update").when("app-state").enters("end"),
    showEndMenu,
  );
  engine.system(
    "hideEndMenu",
    engine.trigger.on("update").when("app-state").exits("end"),
    hideEndMenu,
  );
  engine.system(
    "hideMainMenu",
    engine.trigger.on("update").when("app-state").exits("main-menu"),
    hideMainMenu,
  );

  engine.system(
    "endConditionSystem",
    engine.trigger.on("update").when("app-state").is("in-game"),
    endConditionSystem,
  );
  engine.system(
    "ballCollisionHandlingSystem",
    engine.trigger.on("collision").when("app-state").is("in-game"),
    ballCollisionHandlingSystem,
  );
  engine.system(
    "backboardCollisionHandlingSystem",
    engine.trigger.on("collision").when("app-state").is("in-game"),
    backboardCollisionHandlingSystem,
  );
  engine.system(
    "updateScoreBoard",
    engine.trigger.on("update"),
    updateScoreBoard,
  );
  engine.system(
    "paddleCollisionHandlingSystem",
    engine.trigger.on("collision").when("app-state").is("in-game"),
    paddleCollisionHandlingSystem,
  );
  engine.system(
    "playerPaddleSystem",
    engine.trigger.on("update").when("app-state").is("in-game"),
    playerPaddleSystem,
  );
  engine.system(
    "aiPaddleSystem",
    engine.trigger.on("update").when("app-state").is("in-game"),
    aiPaddleSystem,
  );
  engine.system(
    "ballMovementSystem",
    engine.trigger.on("update").when("app-state").is("in-game"),
    ballMovementSystem,
  );
  engine.system(
    "ballTrajectorySystem",
    engine.trigger.on("update").when("app-state").is("in-game"),
    ballTrajectorySystem,
  );

  return engine;
}

export type { ApplicationState };
