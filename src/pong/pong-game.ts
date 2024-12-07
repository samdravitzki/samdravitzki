import p5 from "p5";
import Vector from "../Vector/Vector";
import World from "../ecs/core/World/World";
import {
  PrimitiveShape,
  Position,
  Velocity,
  BallComponent,
  BackboardComponent,
  Collision,
  Speed,
  PaddleComponent,
  TrajectoryLineSegmentComponent,
} from "./components";
import castRay from "./collision/cast-ray";
import createBundle from "../ecs/core/Bundle/createBundle";
import minionBongUrl from "./sounds/minion-bong.mp3";
import { MousePosition } from "../ecs/core/System/System";
import State from "../ecs/core/State/State";
import Component from "../ecs/core/Component/Component";
import engine from "./pong-engine";
import "./setup/setup-boundaries";
import "./setup/setup-ball";
import "./setup/setup-paddles";
import "./setup/setup-scoreboard";
import "./rendering";

const ballHitAudio = new Audio(minionBongUrl);

const sound = false;

engine.system(
  "showMainMenu",
  {
    event: "update",
    condition: {
      state: "app-state",
      value: "main-menu",
      only: "on-enter",
    },
  },
  (_world, { p }) => {
    const mainMenu = p.select("#main-menu");
    mainMenu?.show();
  }
);

engine.system(
  "showGameMenu",
  {
    event: "update",
    condition: {
      state: "app-state",
      value: "in-game",
      only: "on-enter",
    },
  },
  (_world, { p }, state) => {
    const gameMenu = p.select("#game-menu");
    gameMenu?.show();
  }
);

engine.system(
  "hideGameMenu",
  {
    event: "update",
    condition: {
      state: "app-state",
      value: "main-menu",
      only: "on-enter",
    },
  },
  (_world, { p }) => {
    const gameMenu = p.select("#game-menu");
    gameMenu?.hide();
  }
);

engine.system(
  "endConditionSystem",
  {
    event: "update",
    condition: {
      state: "app-state",
      value: "in-game",
    },
  },
  (_world, {}, state) => {
    const [playerScore, aiScore] = state.score.value;

    if (playerScore >= 3 || aiScore >= 3) {
      state["app-state"].setValue("end");
    }
  }
);
engine.system(
  "showEndMenu",
  {
    event: "update",
    condition: {
      state: "app-state",
      value: "end",
      only: "on-enter",
    },
  },
  (_world, { p }, state) => {
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
);

engine.system(
  "hideEndMenu",
  {
    event: "update",
    condition: {
      state: "app-state",
      value: "end",
      only: "on-exit",
    },
  },
  (_world, { p }) => {
    const endMenu = p.select("#end-menu");
    endMenu?.hide();
  }
);

engine.system(
  "hideMainMenu",
  {
    event: "update",
    condition: {
      state: "app-state",
      value: "in-game",
      only: "on-enter",
    },
  },
  (_world, { p }) => {
    const mainMenu = p.select("#main-menu");
    mainMenu?.hide();
  }
);

// Need a way to factor out and organise these systems and state as they're already getting hard to manage

engine.system(
  "ballCollisionHandlingSystem",
  { event: "update", condition: { state: "app-state", value: "in-game" } },
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
);

engine.system(
  "backboardCollisionHandlingSystem",
  { event: "update", condition: { state: "app-state", value: "in-game" } },
  (world: World, {}, state) => {
    const [playerScore, aiScore] = state.score.value;

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
);

engine.system(
  "updateScoreBoard",
  { event: "update" },
  (world: World, {}, state) => {
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
);

// Describes bow the collision handling worked in the orginial pong game
// https://www.vbforums.com/showthread.php?634246-RESOLVED-How-did-collision-in-the-original-Pong-happen
engine.system(
  "paddleCollisionHandlingSystem",
  { event: "update", condition: { state: "app-state", value: "in-game" } },
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
        world
          .entity(collision.entityId)
          .components.find((c) => c.name === "ball")
      ) {
        ballSpeed.value += ballSpeed.value * 0.1;
      }

      if (sound) {
        ballHitAudio.play();
      }
    }
  }
);
engine.system(
  "playerPaddleSystem",
  { event: "update", condition: { state: "app-state", value: "in-game" } },

  function playerPaddleSystem(
    world: World,
    { mousePosition }: { mousePosition: MousePosition }
  ) {
    for (const [position] of world.query<[Position]>([
      "position",
      "paddle",
      "player",
    ])) {
      const positionChange = mousePosition.y - position.position.y;
      position.position = position.position.plus(
        Vector.create(0, positionChange)
      );

      if (position.position.y < 40) {
        position.position = Vector.create(position.position.x, 40);
      }

      if (position.position.y > 210) {
        position.position = Vector.create(position.position.x, 210);
      }
    }
  }
);
engine.system(
  "aiPaddleSystem",
  { event: "update", condition: { state: "app-state", value: "in-game" } },

  function aiPaddleSystem(world: World) {
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

      if (position.position.y < 40) {
        position.position = Vector.create(position.position.x, 40);
      }

      if (position.position.y > 210) {
        position.position = Vector.create(position.position.x, 210);
      }
    }
  }
);
engine.system(
  "ballMovementSystem",
  { event: "update", condition: { state: "app-state", value: "in-game" } },
  function ballMovementSystem(world: World) {
    const [velocity, position, speed] = world.query<
      [Velocity, Position, Speed, BallComponent]
    >(["velocity", "position", "speed", "ball"])[0];

    position.position = position.position.plus(
      velocity.velocity.times(speed.value)
    );
  }
);

engine.system(
  "ballTrajectorySystem",
  { event: "update", condition: { state: "app-state", value: "in-game" } },
  (world: World, {}, state: Record<string, State<unknown>>) => {
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
          length: 1000,
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
);
engine.run();
