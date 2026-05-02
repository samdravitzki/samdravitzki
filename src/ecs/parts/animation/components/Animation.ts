import Vector from "../../../core/Vector/Vector";
import Component from "../../../core/Component/Component";
import { easings } from "../easing";

type EasingName = keyof typeof easings;

export type AnimationState = "ready" | "running" | "completed";

export type Animation = Component & {
  name: "animation";
  // state of the animation
  startTime?: number;
  t: number;
  elapsedTime: number;
  // configurable properties
  from: Vector;
  to: Vector;
  target: string;
  duration: number;
  loop?: boolean;
  easing?: EasingName;

  // animation state tracking
  state: AnimationState;
  previousState?: AnimationState;
};

/**
 * Factory used to create an animation component
 */
export function createAnimation(params: {
  from: Vector;
  to: Vector;
  target: string;
  duration: number;
  startTime?: number;
  loop?: boolean;
  paused?: boolean;
  easing?: EasingName;
}): Animation {
  return {
    t: 0,
    elapsedTime: 0,
    name: "animation",
    startTime: undefined,
    loop: false,
    state: "ready",
    previousState: undefined,
    ...params,
  };
}
