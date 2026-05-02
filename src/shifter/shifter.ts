import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import World from "../ecs/core/World/World";
import p5Part, { KeypressEvent } from "../ecs/parts/p5/p5-part";
import { PrimitiveShape } from "../ecs/parts/p5/primitive-renderer/components/Primitive";
import gearText from "./gear-text";
import GateNode, { commonGate, Direction } from "./gate";
import animation from "../ecs/parts/animation/animation";
import Vector from "../ecs/core/Vector/Vector";
import {
  Animation,
  createAnimation,
} from "../ecs/parts/animation/components/Animation";
import p5 from "p5";

function setupGate(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  // Draw edges
  for (const node of Object.values(commonGate)) {
    for (const neighbour of node.neighbours) {
      const midPoint = node.position.plus(neighbour.node.position).times(0.5);

      const position: Position = {
        name: "position",
        position: midPoint.plus(canvasBounds.center.center),
      };

      const edge: PrimitiveShape = {
        name: "primitive",
        stroke: [0, 0, 25],
        fill: [0, 0, 25],
        type: "line",
        strokeWeight: 2,
        start: node.position.minus(midPoint),
        end: neighbour.node.position.minus(midPoint),
      };

      world.addBundle(createBundle([edge, position]));
    }
  }

  for (const point of Object.values(commonGate)) {
    const pos = point.position.plus(canvasBounds.center.center);

    const position: Position = {
      name: "position",
      position: pos,
    };

    const primitive: PrimitiveShape =
      point.name === "pass"
        ? {
            name: "primitive",
            fill: [0, 0, 25],
            type: "circle",
            radius: 3,
          }
        : {
            name: "primitive",
            fill: [240, 60, 100],
            type: "circle",
            radius: 5,
          };

    world.addBundle(createBundle([primitive, position]));
  }

  // Shift Lever
  world.addBundle(
    createBundle([
      "shift-lever",
      {
        name: "primitive",
        fill: [0, 60, 100],
        type: "circle",
        radius: 15,
      },
      {
        name: "position",
        position: canvasBounds.center.center,
      },
    ]),
  );
}

const keyToDirectionMap = new Map<string, Direction>();
keyToDirectionMap.set("w", "up");
keyToDirectionMap.set("a", "left");
keyToDirectionMap.set("s", "down");
keyToDirectionMap.set("d", "right");
keyToDirectionMap.set("ArrowUp", "up");
keyToDirectionMap.set("ArrowLeft", "left");
keyToDirectionMap.set("ArrowDown", "down");
keyToDirectionMap.set("ArrowRight", "right");

/**
 * A form of input that mimics the behaviour of a manual cars shifter
 *
 * To not get too sidetracked I want to limit each game/thing to adding a
 * maximum of one new engine feature. For this game/thing I want intend to
 * add animation curves to make the input as satifying as possible
 */
export default function shifter(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .event<"keyReleased", KeypressEvent>("keyReleased")
    .event("after-update")
    .event<"animation:started", Animation>("animation:started")
    .event<"animation:completed", Animation>("animation:completed")
    .state<"shift-position", GateNode>("shift-position", commonGate.neutral)
    .build();

  const t = engine.trigger;

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(gearText());
  engine.part(animation());

  engine.system("setupGate", t.on("setup"), setupGate);

  engine.system("animate-shifter", t.on("update"), (world, resources) => {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const result = world.query<[Animation]>([
      "animation",
      "shift-lever-animation",
    ])[0];

    if (!result) {
      return;
    }

    const [animation] = result;
    const [position] = world.query<[Position]>([
      "position",
      animation.target,
    ])[0];
    const newPos = Vector.lerp(animation.from, animation.to, animation.t);
    position.position = newPos.plus(canvasBounds.center.center);
  });

  engine.system(
    "shift-gear",
    t.on("keyPressed"),
    (world, resources, state, emitter, eventPayload) => {
      const dir = keyToDirectionMap.get(eventPayload.key);
      if (!dir) return;

      const currentShiftPosition = state["shift-position"].value;

      const neighbourInDirection =
        currentShiftPosition.neighborInDirection(dir);

      if (!neighbourInDirection) {
        return;
      }

      state["shift-position"].setValue(neighbourInDirection);

      const shifterAnimation = createAnimation({
        from: currentShiftPosition.position,
        to: neighbourInDirection.position,
        target: "shift-lever",
        duration: 100,
        loop: false,
        startTime: Date.now(),
      });

      world.addBundle(
        createBundle(["shift-lever-animation", shifterAnimation]),
      );
    },
  );

  engine.system(
    "redirect-shifter",
    t.on("animation:completed"),
    (world, resources, state, emitter, eventPayload) => {
      const p = resources.get<p5>("p5");

      if (eventPayload.target === "shift-lever") {
        // add support for event triggers to be conditional on the payload
        const currentShiftPosition = state["shift-position"].value;

        // Set shifter back to neutral if the user doesn't have key down in direction of the next node.
        if (currentShiftPosition.name === "pass") {
          const pressedKey = p.key;
          const pressedDir = keyToDirectionMap.get(pressedKey);

          let nextPosition: GateNode = commonGate.neutral;

          if (pressedDir) {
            const neighbor =
              currentShiftPosition.neighborInDirection(pressedDir);

            if (neighbor) {
              nextPosition = neighbor;
            }
          }

          state["shift-position"].setValue(nextPosition);

          const shifterAnimation = createAnimation({
            from: currentShiftPosition.position,
            to: nextPosition.position,
            target: "shift-lever",
            duration: 100,
            loop: false,
            startTime: Date.now(),
          });

          world.addBundle(
            createBundle(["shift-lever-animation", shifterAnimation]),
          );
        }
      }
    },
  );

  return engine;
}
