import { component, tag, Vector } from "@dravitzki/dufus-engine";

export const Velocity = component<Vector>({ name: "modular-pong-velocity" });
export const Speed = component<number>({ name: "modular-pong-speed" });
export const BackboardOwner = component<"player" | "ai">({
  name: "modular-pong-backboard-owner",
});

export const Ball = tag("modular-pong-ball");
export const Paddle = tag("modular-pong-paddle");
export const PlayerPaddle = tag("modular-pong-player-paddle");
export const AiPaddle = tag("modular-pong-ai-paddle");
export const AiPaddleTarget = tag("modular-pong-ai-paddle-target");
export const PlayerScore = tag("modular-pong-player-score");
export const AiScore = tag("modular-pong-ai-score");
export const TrajectoryLine = tag("modular-pong-trajectory-line");
