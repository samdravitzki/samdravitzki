import p5 from "p5";
import Engine from "../../core/Engine/Engine";
import Bounds from "../../core/Bounds/Bounds";
import Vector from "../../core/Vector/Vector";
import primitiveRendererPart from "./primitive-renderer/primitive-renderer";

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
          systems
            .filter(([trigger]) => trigger.event === "start")
            .forEach(([trigger, system]) => {
              console.debug(`${system.name} on ${trigger.event}`);
              system(world, resources, states);
            });
        };

        p.draw = () => {
          p.background(240, 90, 60);
          resources.set("mouse-position", {
            x: p.mouseX,
            y: p.mouseY,
          });
          resources.set("p5", p);
          // run systems scheduled for p5 draw
          systems
            .filter(([trigger]) => trigger.event === "update")
            .forEach(([trigger, system]) => {
              console.debug(`${system.name} on ${trigger.event}`);
              system(world, resources, states);
            });
        };

        p.keyPressed = () => {};
      }, parent);

      return () => {
        p5Instance.remove();
      };
    });

    engine.part(primitiveRendererPart);
  };
}

export default p5Part;
