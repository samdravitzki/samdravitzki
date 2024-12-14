import Component from "../ecs/core/Component/Component";
import Vector from "../ecs/core/Vector/Vector";

export type Velocity = Component & {
  name: "velocity";
  velocity: Vector;
};

export type Speed = {
  name: "speed";
  value: number;
};

export type BallComponent = Component & {
  name: "ball";
};

export type PaddleComponent = Component & {
  name: "paddle";
};

export type PlayerComponent = Component & {
  name: "player";
};

export type AiComponent = Component & {
  name: "ai";
};

export type BackboardComponent = Component & {
  name: "backboard";
  owner: "player" | "ai";
};

export type TrajectoryLineSegmentComponent = Component & {
  name: "trajectory-line-segment";
};
