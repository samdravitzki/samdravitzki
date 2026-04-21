import { Part } from "../../core/Part/Part";
import { Animation } from "./components/Animation";
import { easings } from "./easing";

function tick(animation: Animation) {
  const elapsed = animation.startTime ? Date.now() - animation.startTime : 0;

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
  }> = ({ registerSystem, triggerBuilder }) => {
    registerSystem("animate", triggerBuilder.on("update"), (world) => {
      const animations = world.query<[Animation]>(["animation"]);

      for (const [animation] of animations) {
        animation.t = tick(animation);
      }
    });
  };

  return part;
}

export default animation;
