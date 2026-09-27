import { Part } from "../../core/Part/Part";
import Vector from "../../core/Vector/Vector";
import Animation, { AnimationData } from "./components/Animation";
import { easings } from "./easing";

function isFinsihed(animation: AnimationData) {
  return !animation.loop && animation.t >= 1;
}

function calculateElapsedTime(animation: AnimationData) {
  return animation.startTime ? Date.now() - animation.startTime : 0;
}

function tick(animation: AnimationData) {
  const elapsed = animation.elapsedTime;

  let t = 0;
  if (animation.loop) {
    t = (elapsed % animation.duration) / animation.duration; // Normalize elapsed time to a value between 0 and 1
  } else {
    t = Math.min(elapsed / animation.duration, 1); // Clamp to 1 if elapsed time exceeds duration
  }

  const selectedEasing = animation.easing || "easeInOutCubic";

  const easedT = easings[selectedEasing](t);

  return easedT;
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  const proto = Object.getPrototypeOf(value);

  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    proto === Object.prototype
  );
}

type InterpolationFunction<T> = (from: T, to: T, t: number) => T;

function selectInterpolationFunction(
  from: any,
  to: any,
): InterpolationFunction<any> | undefined {
  if (typeof from === "number" && typeof to === "number") {
    return lerp;
  }

  if (from instanceof Vector && to instanceof Vector) {
    return Vector.lerp;
  }
}

function animation() {
  const part: Part<{
    update: void;
    "after-update": void;
    "animation:started": AnimationData;
    "animation:completed": AnimationData;
  }> = ({ registerSystem, triggerBuilder }) => {
    registerSystem("animate", triggerBuilder.on("update"), (world) => {
      const animations = world.query([Animation]);

      for (const [animation] of animations) {
        const animationData = animation.componentData;

        animationData.elapsedTime = calculateElapsedTime(animationData);

        animationData.t = tick(animationData);

        animationData.previousState = animationData.state;
        animationData.state = !isFinsihed(animationData)
          ? "running"
          : "completed";

        const [component] = world.query([
          animationData.Component,
          animationData.target,
        ])[0];

        /**
         * DevX improvement:
         * Would be a nice addition to not have to specify a 'from' state for the animation
         * if the target entity already has that component with the desired initial state.
         *
         * Also the other way around where if you configure a 'from' state on the animation
         * the targe entity shouldn't need to have that component specified
         */

        if (isPlainRecord(animationData.to)) {
          const keys = Object.keys(animationData.to);

          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (!component || !isPlainRecord(component.componentData)) {
              continue;
            }

            if (
              !isPlainRecord(animationData.from) ||
              !(key in animationData.from)
            ) {
              continue;
            }

            const interpolationFunction = selectInterpolationFunction(
              animationData.from[key],
              animationData.to[key],
            );

            if (interpolationFunction) {
              component.componentData[key] = interpolationFunction(
                animationData.from[key],
                animationData.to[key],
                animationData.t,
              );
            }
          }
        } else {
          const interpolationFunction = selectInterpolationFunction(
            animationData.from,
            animationData.to,
          );

          if (interpolationFunction) {
            component.componentData = interpolationFunction(
              animationData.from,
              animationData.to,
              animationData.t,
            );
          }
        }
      }
    });

    registerSystem(
      "animation-events",
      triggerBuilder.on("update"),
      (world, resources, state, emitter) => {
        const animations = world.query([Animation]);

        for (const [animation] of animations) {
          const animationData = animation.componentData;

          const justStarted =
            animationData.state === "running" &&
            animationData.previousState === "ready";

          if (justStarted) {
            emitter.emit({
              event: "animation:started",
              payload: animationData,
            });
          }

          const justFinished =
            animationData.state === "completed" &&
            animationData.previousState === "running";

          if (justFinished) {
            emitter.emit({
              event: "animation:completed",
              payload: animationData,
            });
          }
        }
      },
    );

    registerSystem(
      "animation-cleanup",
      triggerBuilder.on("after-update"),
      (world) => {
        const animations = world.query([Animation, "entity-id"]);

        for (const [animation, entityId] of animations) {
          const animationData = animation.componentData;
          if (isFinsihed(animationData) && !animationData.persistent) {
            world.removeEntity(entityId);
          }
        }
      },
    );
  };

  return part;
}

export default animation;
