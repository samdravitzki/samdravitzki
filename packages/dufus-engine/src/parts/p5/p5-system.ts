import p5 from "p5";
import World from "../../core/World/World";
import Bounds from "../../core/Bounds/Bounds";
import Vector from "../../core/Vector/Vector";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { EventEmitter } from "../../core/System/System";

export type MousePosition = {
  x: number;
  y: number;
};

export type KeypressEvent = {
  key: string;
  keyCode: string;
};

export type ClickEventPayload = {
  type: "press" | "release";
  position: MousePosition;
  button: number; // 0 = left click, 1 = middle click, 2 = right click
};

export type P5Events = {
  update: void;
  "after-update": void;
  init: void;
  setup: void;
  keyPressed: KeypressEvent;
  keyReleased: KeypressEvent;
  "click:press": ClickEventPayload;
  "click:release": ClickEventPayload;
  click: ClickEventPayload;
};

function createP5System(
  size: [number, number],
  parent?: HTMLElement,
  background: [number, number, number] | string = [240, 90, 60],
  hideCursor: boolean = false,
) {
  return function p5System(
    world: World,
    resources: ResourcePool,
    state: unknown,
    eventEmitter: EventEmitter<P5Events>,
  ) {
    const canvasBounds = Bounds.create(
      Vector.create(0, 0),
      Vector.create(...size),
    );

    const p5Instance = new p5((sketch) => {
      const p = sketch;
      p.setup = () => {
        resources.set("p5", p);
        p.createCanvas(canvasBounds.width, canvasBounds.height);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noStroke();
        p.smooth();
        p.rectMode(p.CENTER);
        if (hideCursor) {
          p.noCursor();
        }
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
        } satisfies MousePosition);
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
        // Not enabled because it blocks inputs to the inspector feilds
        // return true;
      };

      p.keyReleased = (event) => {
        if (!event) return;

        const payload: KeypressEvent = {
          key: event.key,
          keyCode: event.code,
        };

        eventEmitter.emit({ event: "keyReleased", payload });
      };

      p.mousePressed = (event) => {
        if (!event) return;

        const payload: ClickEventPayload = {
          type: "press",
          position: { x: event.x, y: event.y },
          button: event.button,
        };

        eventEmitter.emit({ event: "click", payload });
        eventEmitter.emit({ event: "click:press", payload });
      };

      p.mouseReleased = (event) => {
        if (!event) return;

        const payload: ClickEventPayload = {
          type: "release",
          position: { x: event.x, y: event.y },
          button: event.button,
        };

        eventEmitter.emit({ event: "click", payload });
        eventEmitter.emit({
          event: "click:release",
          payload,
        });
      };
    }, parent);

    return () => {
      p5Instance.remove();
    };
  };
}

export default createP5System;
