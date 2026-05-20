import { Part } from "../../core/Part/Part";
import primitiveRendererSystem from "./primitive-renderer/primitive-renderer";
import createP5System, {
  KeypressEvent,
  MousePosition,
  P5Events,
} from "./p5-system";

function p5Part(
  size: [number, number],
  parent?: HTMLElement,
  background: [number, number, number] | string = [240, 90, 60],
) {
  const part: Part<P5Events> = ({ registerSystem, triggerBuilder }) => {
    registerSystem(
      "p5",
      triggerBuilder.on("init"),
      createP5System(size, parent, background),
    );
    registerSystem(
      "primitive-renderer",
      triggerBuilder.on("after-update"),
      primitiveRendererSystem,
    );
  };

  return part;
}

export default p5Part;
export type { KeypressEvent, MousePosition };
