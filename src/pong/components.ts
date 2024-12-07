import Component from "../ecs/core/Component/Component";
import Vector from "../Vector/Vector";

export type Velocity = Component & {
  name: "velocity";
  velocity: Vector;
};

export type PrimitiveShape = Component & {
  name: "primitive";
  stroke?: number[];
  strokeWeight?: number;
  fill: false | number[]; // Fill doesn't make sense for line
  dash?: number[];
  dashOffset?: number;
} & (
    | {
        type: "circle";
        radius: number;
      }
    | {
        type: "line";
        start: Vector;
        end: Vector;
      }
    | {
        type: "square";
        width: number;
        height: number;
      }
    | {
        type: "text";
        align: "left" | "right";
        size: number;
        text: string;
      }
  );

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
