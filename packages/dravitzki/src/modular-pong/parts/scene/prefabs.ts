import { createBundle, Position, Vector } from "@dravitzki/dufus-engine";
import { Collider } from "@dravitzki/dufus-engine/parts/collisions";
import {
  Circle,
  ShapeStyle,
  Square,
  Typography,
} from "@dravitzki/dufus-engine/parts/p5";
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

export function createBall(position: Vector) {
  return createBundle([
    Ball(),
    Circle({ radius: 5 }),
    ShapeStyle({ stroke: [240, 60, 100], strokeWeight: 2 }),
    Position({ position }),
    Velocity(new Vector(-0.5, -0.5)),
    Speed(5),
    Collider({ type: "aabb", width: 10, height: 10 }),
  ]);
}

export function createWall(position: Vector, width: number, height: number) {
  return createBundle([
    Square({ width, height }),
    ShapeStyle({ fill: [240, 60, 100] }),
    Collider({ layer: "wall", type: "aabb", width, height }),
    Position({ position }),
  ]);
}

export function createBackboard(
  position: Vector,
  width: number,
  height: number,
  owner: "player" | "ai",
) {
  return createBundle([
    Square({ width, height }),
    ShapeStyle({ fill: [352, 94, 100] }),
    Position({ position }),
    Collider({ type: "aabb", layer: "wall", width, height }),
    BackboardOwner(owner),
  ]);
}

export function createPaddle(position: Vector, owner: "player" | "ai") {
  const paddleSize = 40;

  return createBundle([
    owner === "player" ? PlayerPaddle() : AiPaddle(),
    Paddle(),
    Square({ width: 5, height: paddleSize }),
    ShapeStyle({ fill: [240, 60, 100] }),
    Position({ position }),
    Speed(0.01),
    Collider({
      type: "aabb",
      layer: "wall",
      width: 5,
      height: paddleSize,
    }),
  ]);
}

export function createAiPaddleTarget() {
  return createBundle([
    AiPaddleTarget(),
    Position({ position: new Vector(0, 0) }),
  ]);
}

export function createScore(
  position: Vector,
  align: "left" | "right",
  owner: "player" | "ai",
) {
  return createBundle([
    owner === "player" ? PlayerScore() : AiScore(),
    Position({ position }),
    Typography({ text: "0", align, size: 25 }),
    ShapeStyle({
      stroke: [240, 60, 100],
      strokeWeight: 2,
      fill: [240, 60, 100],
    }),
  ]);
}
