import Component from "../ecs/core/Component/Component";
import Vector from "../Vector/Vector";

export type Position = Component & {
  name: "position";
  position: Vector;
};

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

export type Collider = Component & {
  name: "collider";
  layer?: string;
} & {
  type: "aabb"; // Axis-aligned bounding box (Just a rectangle that doesnt rotate)
  width: number;
  height: number;
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

export type Collision = Component & {
  name: "collision";
  // The collision point of the entity in local space
  contactPoint: Vector;
  // The normal of the point collided with
  normal: Vector;
  // The depth in which the collision occured
  penetration: number;
  // The id of the entity colided with
  entityId: string;
};
