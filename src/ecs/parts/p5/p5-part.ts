import p5 from "p5";
import primitiveRendererSystem from "./primitive-renderer/primitive-renderer";
import World from "../../core/World/World";
import Bounds from "../../core/Bounds/Bounds";
import Vector from "../../core/Vector/Vector";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { EventEmitter } from "../../core/System/System";
import { Part } from "../../core/Part/Part";

type MousePosition = {
  x: number;
  y: number;
};

type KeypressEvent = {
  key: string;
  keyCode: string;
};

type P5Events = {
  update: void;
  "after-update": void;
  init: void;
  setup: void;
  keyPressed: KeypressEvent;
  keyReleased: KeypressEvent;
};

function createP5System(
  size: [number, number],
  parent?: HTMLElement,
  background: [number, number, number] | string = [240, 90, 60],
) {
  return function p5System(
    world: World,
    resources: ResourcePool,
    state: unknown,
    eventEmitter: EventEmitter<P5Events>,
  ) {
    const p5Instance = new p5((sketch) => {
      const p = sketch;
      const canvasBounds = Bounds.create(
        Vector.create(0, 0),
        Vector.create(...size),
      );
      p.setup = () => {
        resources.set("p5", p);
        p.createCanvas(...canvasBounds.size);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noStroke();
        p.rectMode(p.CENTER);
        resources.set("canvas-bounds", canvasBounds);
        eventEmitter.emit({ event: "setup" });
      };

      p.draw = () => {
        p.background(
          Array.isArray(background)
            ? p.color(...background)
            : p.color(background),
        );
        resources.set("p5", p);
        resources.set("mouse-position", {
          x: p.mouseX,
          y: p.mouseY,
        });
        eventEmitter.emit({ event: "update" });
        eventEmitter.emit({ event: "after-update" });
      };

      p.keyPressed = (event) => {
        if (!event) return;

        const payload: KeypressEvent = {
          key: event.key,
          keyCode: event.code,
        };

        eventEmitter.emit({ event: "keyPressed", payload });

        // Prevent default browser behavior for certain keys (like arrow keys, space, etc.)
        return false;
      };

      p.keyReleased = (event) => {
        if (!event) return;

        const payload: KeypressEvent = {
          key: event.key,
          keyCode: event.code,
        };

        eventEmitter.emit({ event: "keyReleased", payload });
      };
    }, parent);

    return () => {
      p5Instance.remove();
    };
  };
}

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
      "renderer",
      triggerBuilder.on("after-update"),
      primitiveRendererSystem,
    );
  };

  return part;
}

export default p5Part;
export type { KeypressEvent, MousePosition };
