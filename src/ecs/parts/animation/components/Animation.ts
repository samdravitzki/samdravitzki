import Vector from "../../../core/Vector/Vector";
import Component from "../../../core/Component/Component";
import { easings } from "../easing";

type EasingName = keyof typeof easings;

export type Animation = Component & {
  name: "animation";
  // configurable properties
  from: Vector;
  to: Vector;
  target: string;
  duration: number;
  loop?: boolean;
  easing?: EasingName;
  // state of the animation
  t: number;
  startTime?: number;
};

/**
 * Factory used to create an animation component
 */
export function createAnimation(params: {
  from: Vector;
  to: Vector;
  target: string;
  duration: number;
  loop?: boolean;
  paused?: boolean;
  easing?: EasingName;
}): Animation {
  return {
    name: "animation",
    t: 0,
    startTime: undefined,
    loop: false,
    ...params,
  };
}
