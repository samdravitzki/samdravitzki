import p5 from "p5";
import Engine from "../../core/Engine/Engine";
import Bounds from "../../core/Bounds/Bounds";
import Vector from "../../core/Vector/Vector";
import primitiveRendererSystem from "./primitive-renderer/primitive-renderer";
import { onUpdate } from "../../core/Engine/SystemTrigger";

export type MousePosition = {
  x: number;
  y: number;
};

function p5Part<T extends Record<string, unknown>>(
  size: [number, number],
  parent?: HTMLElement
) {
  return (engine: Engine<T>) => {
    engine.runner((systems, world, resources, states) => {
      const p5Instance = new p5((sketch) => {
        const p = sketch as unknown as p5;
        const canvasBounds = Bounds.create(
          Vector.create(0, 0),
          Vector.create(...size)
        );

        p.setup = () => {
          p.createCanvas(...canvasBounds.size);
          p.colorMode(p.HSB, 360, 100, 100, 100);
          p.noStroke();
          p.rectMode(p.CENTER);
          resources.set("canvas-bounds", canvasBounds);
          resources.set("p5", p);

          // Run systems on start
        };

        p.draw = () => {
          p.background(240, 90, 60);
          resources.set("mouse-position", {
            x: p.mouseX,
            y: p.mouseY,
          });
          resources.set("p5", p);

          // Run systems that can run on this update loop
          // Need to make something that when given the engine context it decides which systems run
        };

        p.keyPressed = () => {};
      }, parent);

      return () => {
        p5Instance.remove();
      };
    });

    engine.system("renderer", onUpdate(), primitiveRendererSystem);
  };
}

export default p5Part;
