import p5 from "p5";
import primitiveRendererSystem from "./primitive-renderer/primitive-renderer";
import World from "../../core/World/World";
import Bounds from "../../core/Bounds/Bounds";
import Vector from "../../core/Vector/Vector";
import { ResourcePool } from "../../core/Engine/ResourcePool";
import { EventEmitter } from "../../core/System/System";
import { Part } from "../../core/Part/Part";

export type MousePosition = {
  x: number;
  y: number;
};

type P5Events = {
  update: unknown;
  "after-update": unknown;
  init: unknown;
  setup: unknown;
  keyPressed: unknown;
};

function createP5System(size: [number, number], parent?: HTMLElement) {
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
        p.background(240, 90, 60);
        resources.set("p5", p);
        resources.set("mouse-position", {
          x: p.mouseX,
          y: p.mouseY,
        });
        eventEmitter.emit({ event: "update" });
        eventEmitter.emit({ event: "after-update" });
      };

      p.keyPressed = () => {
        eventEmitter.emit({ event: "keyPressed" });
      };
    }, parent);

    return () => {
      p5Instance.remove();
    };
  };
}

function p5Part(size: [number, number], parent?: HTMLElement) {
  const part: Part<P5Events> = ({ registerSystem, triggerBuilder }) => {
    registerSystem(
      "p5",
      triggerBuilder.on("init"),
      createP5System(size, parent),
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
