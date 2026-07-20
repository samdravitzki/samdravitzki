import Vector from "../../../core/Vector/Vector";
import { component, tag } from "../../../core/Component/Component";
import { easings } from "../easing";
import createBundle from "../../../core/Bundle/createBundle";

export type EasingName = keyof typeof easings;

export type AnimationState = "ready" | "running" | "completed";

export type AnimationData = {
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

export const Animation = component<AnimationData>({
  name: "animation",
});

/**
 * Factory used to create an animation component
 */
export function createAnimation(params: {
  name: string;
  from: Vector;
  to: Vector;
  target: string;
  duration: number;
  startTime?: number;
  loop?: boolean;
  paused?: boolean;
  easing?: EasingName;
}) {
  const { name, ...animationParams } = params;

  const animations = Animation({
    t: 0,
    elapsedTime: 0,
    name: "animation",
    startTime: undefined,
    loop: false,
    state: "ready",
    previousState: undefined,
    ...animationParams,
  });

  const animationNameTag = tag(name);

  return createBundle([animationNameTag(), animations]);
}

export default Animation;
