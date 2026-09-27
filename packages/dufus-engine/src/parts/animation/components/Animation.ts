import {
  createBundle,
  Component,
  component,
  ComponentToken,
  tag,
} from "../../../core";
import { easings } from "../easing";

export type EasingName = keyof typeof easings;

export type AnimationState = "ready" | "running" | "completed";

type ComponentData<T> = T extends ComponentToken<infer U> ? U : never;

export type AnimationData<
  T extends ComponentToken<unknown> = ComponentToken<unknown>,
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
  persistent?: boolean; // whether the animation should be cleaned up after completion

  // animation state tracking
  state: AnimationState;
  previousState?: AnimationState;
};

export const Animation = component<AnimationData>({
  name: "animation",
});

type AnimationConfig<T> = {
  from: T;
  to: T;
  duration: number;
  target: string;
  easing?: EasingName;
  persistent?: boolean;
  loop?: boolean;
  startTime?: number;
  name?: string;
};

/**
 * Define an animation for a given component based on the provided configuration.
 *
 * A factory function used to create an Animation entity.
 *
 * The interface is very much inspired by anime.js animate function.
 *
 * @param Component The component token representing the type of component being animated.
 * @param config The configuration object containing animation parameters such as from, to, duration, target, easing, loop, and startTime.
 * @returns A bundle containing the created animation component.
 */
export function animate<T extends ComponentToken<unknown>>(
  Component: T,
  config: AnimationConfig<ComponentData<T>>,
) {
  const animation = Animation({
    t: 0,
    elapsedTime: 0,
    name: "animation",
    state: "ready",
    previousState: undefined,
    persistent: config.persistent ?? false,
    Component: Component,
    from: config.from,
    to: config.to,
    target: config.target,
    duration: config.duration,
    loop: config.loop,
    easing: config.easing,
    startTime: config.startTime ?? Date.now(),
  });

  const components: Component[] = [animation];

  if (config.name) {
    const animationNameTag = tag(config.name);
    components.push(animationNameTag());
  }

  return createBundle(components);
}

export default Animation;
