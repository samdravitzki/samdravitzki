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
          systems
            .filter(([trigger]) => trigger.event === "start")
            .forEach(([trigger, system]) => {
              // console.debug(`${system.name} on ${trigger.event}`);
              system(world, resources, states);
            });

          // systems
          //   .filter(([trigger]) => trigger.event === "state-change")
          //   .forEach(([trigger, system]) => {
          //     // Rather than having the state handle running the function itself it
          //     // may be simpler if instead we can ask which states have changed this
          //     // frame and run the associated systems instead (i.e. move away from the
          //     // observer pattern)

          //     // this way the runner is still the only thing responsible for defining
          //     // when the systems run and we can ensure that all systems can receive the
          //     // same resources

          //     // This would also enable triggers to be implemented as functions that
          //     // we pass the state of the system and based on what it is they return
          //     // a boolean and if true we run its associated system

          //     // State changes would then just be treated as events that last a single frame
          //     // and would make it easy to add this behaviour for different kinds of events
          //     // such as key input
          //     const state = states[trigger];

          //     state
          //   });
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
              // console.debug(`${system.name} on ${trigger.event}`);
              system(world, resources, states);
            });
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
