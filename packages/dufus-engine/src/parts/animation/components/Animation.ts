import Vector from "../../../core/Vector/Vector";
import {
  component,
  ComponentSpec,
  tag,
} from "../../../core/Component/Component";
import { easings } from "../easing";
import createBundle from "../../../core/Bundle/createBundle";

export type EasingName = keyof typeof easings;

export type AnimationState = "ready" | "running" | "completed";

type ComponentData<T> = T extends ComponentSpec<infer U> ? U : never;

export type AnimationData<
  T extends ComponentSpec<unknown> = ComponentSpec<unknown>,
> = {
  name: "animation";
  Component: T;
  // state of the animation
  startTime?: number;
  t: number;
  elapsedTime: number;
  // configurable properties
  from: ComponentData<T>;
  to: ComponentData<T>;
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
export function createAnimation<T extends ComponentSpec<any>>(params: {
  name: string;
  Component: T;
  from: ComponentData<T>;
  to: ComponentData<T>;
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
