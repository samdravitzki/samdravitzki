import { Part } from "../../core/Part/Part";
import Animation, { AnimationData } from "./components/Animation";
import { easings } from "./easing";
import { selectInterpolationFunction } from "./interpolation";

function isFinished(animation: AnimationData) {
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

function selectKeyframe(animation: AnimationData) {
  if (animation.keyframes.length === 1) {
    return animation.keyframes[0];
  }

  const keyframeDuration = animation.duration / animation.keyframes.length;

  const elapsed = animation.elapsedTime % animation.duration;

  const keyframeIndex = Math.floor(elapsed / keyframeDuration);

  return animation.keyframes[keyframeIndex];
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
        animationData.state = !isFinished(animationData)
          ? "running"
          : "completed";

        const [component] = world.query([
          animationData.Component,
          animationData.target,
        ])[0];

        const keyframe = selectKeyframe(animationData);

        /**
         * DevX improvement:
         * Would be a nice addition to not have to specify a 'from' state for the animation
         * if the target entity already has that component with the desired initial state.
         *
         * Also the other way around where if you configure a 'from' state on the animation
         * the targe entity shouldn't need to have that component specified
         */

        if (isPlainRecord(keyframe.to)) {
          const keys = Object.keys(keyframe.to);

          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (!component || !isPlainRecord(component.componentData)) {
              continue;
            }

            if (!isPlainRecord(keyframe.from) || !(key in keyframe.from)) {
              continue;
            }

            const interpolationFunction = selectInterpolationFunction(
              keyframe.from[key],
              keyframe.to[key],
            );

            if (interpolationFunction) {
              component.componentData[key] = interpolationFunction(
                keyframe.from[key],
                keyframe.to[key],
                animationData.t,
              );
            }
          }
        } else {
          const interpolationFunction = selectInterpolationFunction(
            keyframe.from,
            keyframe.to,
          );

          if (interpolationFunction) {
            component.componentData = interpolationFunction(
              keyframe.from,
              keyframe.to,
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
          if (isFinished(animationData) && !animationData.persistent) {
            world.removeEntity(entityId);
          }
        }
      },
    );
  };

  return part;
}

export default animation;
