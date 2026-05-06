import { Position } from "../../components/Position";
import { EntityId } from "../../core/Entity/Entity";
import { Part } from "../../core/Part/Part";
import Vector from "../../core/Vector/Vector";
import { Animation } from "./components/Animation";
import { easings } from "./easing";

function isFinsihed(animation: Animation) {
  return !animation.loop && animation.t >= 1;
}

function calculateElapsedTime(animation: Animation) {
  return animation.startTime ? Date.now() - animation.startTime : 0;
}

function tick(animation: Animation) {
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
    "animation:started": Animation;
    "animation:completed": Animation;
  }> = ({ registerSystem, triggerBuilder }) => {
    registerSystem("animate", triggerBuilder.on("update"), (world) => {
      const animations = world.query<[Animation]>(["animation"]);

      for (const [animation] of animations) {
        animation.elapsedTime = calculateElapsedTime(animation);

        animation.t = tick(animation);

        animation.previousState = animation.state;
        animation.state = !isFinsihed(animation) ? "running" : "completed";

        const [position] = world.query<[Position]>([
          "position",
          animation.target,
        ])[0];

        position.position = Vector.lerp(
          animation.from,
          animation.to,
          animation.t,
        );
      }
    });

    registerSystem(
      "animation-events",
      triggerBuilder.on("update"),
      (world, resources, state, emitter) => {
        const animations = world.query<[Animation]>(["animation"]);

        for (const [animation] of animations) {
          const justStarted =
            animation.state === "running" &&
            animation.previousState === "ready";

          if (justStarted) {
            emitter.emit({ event: "animation:started", payload: animation });
          }

          const justFinished =
            animation.state === "completed" &&
            animation.previousState === "running";

          if (justFinished) {
            emitter.emit({ event: "animation:completed", payload: animation });
          }
        }
      },
    );

    registerSystem(
      "animation-cleanup",
      triggerBuilder.on("after-update"),
      (world) => {
        const animations = world.query<[Animation, string]>([
          "animation",
          "entity-id",
        ]);

        for (const [animation, entityId] of animations) {
          if (isFinsihed(animation)) {
            world.removeEntity(entityId);
          }
        }
      },
    );
  };

  return part;
}

export default animation;
