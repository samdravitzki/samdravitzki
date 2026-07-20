import { Position } from "../../components";
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

        const [position] = world.query([Position, animationData.target])[0];

        position.componentData.position = Vector.lerp(
          animationData.from,
          animationData.to,
          animationData.t,
        );
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
          if (isFinsihed(animationData)) {
            world.removeEntity(entityId);
          }
        }
      },
    );
  };

  return part;
}

export default animation;
