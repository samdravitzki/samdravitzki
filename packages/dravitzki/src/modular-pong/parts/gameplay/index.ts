import {
  Component,
  Part,
  Position,
  ResourcePool,
  State,
  Vector,
  World,
} from "@dravitzki/dufus-engine";
import { CollisionContactEvent } from "@dravitzki/dufus-engine/parts/collisions";
import { Typography } from "@dravitzki/dufus-engine/parts/p5";
import {
  AiPaddle,
  AiPaddleTarget,
  AiScore,
  BackboardOwner,
  Ball,
  Paddle,
  PlayerPaddle,
  PlayerScore,
  Speed,
  Velocity,
} from "../../common/components";
import {
  contactEntity,
  contactPair,
  requiredComponent,
  singleQuery,
} from "../../common/query";
import { ApplicationState, Score } from "../../common/types";

type GameplayEvents = {
  update: void;
  collision: CollisionContactEvent;
};

type GameplayState = {
  "app-state": ApplicationState;
  score: Score;
};

export const gameplayPart = (): Part<GameplayEvents, GameplayState> => {
  return ({ triggerBuilder, registerSystem }) => {
    const whilePlaying = triggerBuilder
      .on("update")
      .when("app-state")
      .is("in-game");
    const collisionWhilePlaying = triggerBuilder
      .on("collision")
      .when("app-state")
      .is("in-game");

    registerSystem("modular-pong:end-game", whilePlaying, endGameAtWinningScore);
    registerSystem(
      "modular-pong:handle-ball-collision",
      collisionWhilePlaying,
      handleBallCollision,
    );
    registerSystem(
      "modular-pong:handle-score",
      collisionWhilePlaying,
      handleScore,
    );
    registerSystem(
      "modular-pong:increase-ball-speed",
      collisionWhilePlaying,
      handlePaddleCollisionSpeed,
    );
    registerSystem(
      "modular-pong:update-scoreboard",
      triggerBuilder.on("update"),
      updateScoreboard,
    );
  };
};

function componentFromSingleQuery<T>(
  results: [Component<T>][],
  description: string,
) {
  return singleQuery(results, description)[0];
}

export function endGameAtWinningScore(
  _world: World,
  _resources: ResourcePool,
  state: { score: State<Score>; "app-state": State<ApplicationState> },
) {
  const [playerScore, aiScore] = state.score.value;

  if (playerScore >= 3 || aiScore >= 3) {
    state["app-state"].setValue("end");
  }
}

export function handleBallCollision(
  world: World,
  _resources: ResourcePool,
  _state: unknown,
  _eventEmitter: unknown,
  contact: CollisionContactEvent,
) {
  if (contact.type !== "enter") {
    return;
  }

  const ball = contactEntity(world, contact, Ball);

  if (!ball) {
    return;
  }

  const velocity = requiredComponent(ball, Velocity, "Ball");
  velocity.componentData = velocity.componentData.reflect(contact.normal);

  const pair = contactPair(world, contact, Ball, Paddle);

  if (!pair) {
    return;
  }

  const [, paddle] = pair;
  const ballPosition = requiredComponent(ball, Position, "Ball");
  const paddlePosition = requiredComponent(paddle, Position, "Paddle");

  const yDistanceFromPaddleCenter =
    paddlePosition.componentData.position.minus(
      ballPosition.componentData.position,
    ).y;

  velocity.componentData = Vector.create(
    velocity.componentData.x,
    -yDistanceFromPaddleCenter / 25,
  );
}

export function handlePaddleCollisionSpeed(
  world: World,
  _resources: ResourcePool,
  _state: unknown,
  _eventEmitter: unknown,
  contact: CollisionContactEvent,
) {
  if (contact.type !== "enter") {
    return;
  }

  const pair = contactPair(world, contact, Ball, Paddle);

  if (!pair) {
    return;
  }

  const [ball] = pair;
  const speed = requiredComponent(ball, Speed, "Ball");
  speed.componentData += speed.componentData * 0.1;
}

export function handleScore(
  world: World,
  _resources: ResourcePool,
  state: { score: State<Score> },
  _eventEmitter: unknown,
  contact: CollisionContactEvent,
) {
  if (contact.type !== "enter") {
    return;
  }

  const pair = contactPair(world, contact, Ball, BackboardOwner);

  if (!pair) {
    return;
  }

  const [ball, backboard] = pair;
  const position = requiredComponent(ball, Position, "Ball");
  const velocity = requiredComponent(ball, Velocity, "Ball");
  const speed = requiredComponent(ball, Speed, "Ball");
  const owner = requiredComponent(backboard, BackboardOwner, "Backboard");
  const [playerScore, aiScore] = state.score.value;

  position.componentData.position = Vector.create(200, 40);

  if (owner.componentData === "player") {
    state.score.setValue([playerScore, aiScore + 1]);
    velocity.componentData = new Vector(-0.5, -0.5).plus(
      new Vector(-0.1, -0.1).times(playerScore + aiScore),
    );
  } else {
    state.score.setValue([playerScore + 1, aiScore]);
    velocity.componentData = new Vector(0.5, -0.5).plus(
      new Vector(0.1, -0.1).times(playerScore + aiScore),
    );
  }

  speed.componentData = 3;
}

export function updateScoreboard(
  world: World,
  _resources: ResourcePool,
  state: { score: State<Score> },
) {
  const [playerScore, aiScore] = state.score.value;
  const playerScoreText = componentFromSingleQuery(
    world.query([Typography, PlayerScore]),
    "player score display",
  );
  const aiScoreText = componentFromSingleQuery(
    world.query([Typography, AiScore]),
    "AI score display",
  );

  playerScoreText.componentData.text = playerScore.toString();
  aiScoreText.componentData.text = aiScore.toString();
}
