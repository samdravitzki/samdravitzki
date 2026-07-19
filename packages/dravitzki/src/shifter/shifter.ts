import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import World from "../ecs/core/World/World";
import p5Part, { KeypressEvent } from "../ecs/parts/p5/p5-part";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Line } from "../ecs/parts/p5/shape-components";
import { Circle } from "../ecs/parts/p5/shape-components";
import gearText from "./gear-text";
import GateNode, { commonGate, Direction } from "./gate";
import animation from "../ecs/parts/animation/animation";
import inspector from "../ecs/parts/inspector/inspector";
import Animation, {
  AnimationData,
  createAnimation,
} from "../ecs/parts/animation/components/Animation";
import p5 from "p5";
import State from "../ecs/core/State/State";
import { EventEmitter } from "../ecs/core/System/System";
import Position from "../ecs/components/Position";
import Label from "../ecs/core/Component/Label";
import { tag } from "../ecs/core/Component/Component";

type ShiftEventPayload = { from: GateNode; to: GateNode };

const keyToDirectionMap = new Map<string, Direction>();
keyToDirectionMap.set("w", "up");
keyToDirectionMap.set("a", "left");
keyToDirectionMap.set("s", "down");
keyToDirectionMap.set("d", "right");
keyToDirectionMap.set("ArrowUp", "up");
keyToDirectionMap.set("ArrowLeft", "left");
keyToDirectionMap.set("ArrowDown", "down");
keyToDirectionMap.set("ArrowRight", "right");

function buildGate(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  // Draw edges
  for (const node of Object.values(commonGate)) {
    for (const neighbour of node.neighbours) {
      const midPoint = node.position.plus(neighbour.node.position).times(0.5);

      const position = Position({
        position: midPoint.plus(canvasBounds.center.center),
      });

      const edge = Line({
        start: node.position.minus(midPoint),
        end: neighbour.node.position.minus(midPoint),
      });

      const style = ShapeStyle({
        stroke: [0, 0, 25],
        fill: [0, 0, 25],
        strokeWeight: 2,
      });

      world.addBundle(
        createBundle([
          edge,
          position,
          style,
          Label({
            text: "line",
          }),
        ]),
      );
    }
  }

  for (const point of Object.values(commonGate)) {
    const pos = point.position.plus(canvasBounds.center.center);

    const position = Position({
      position: pos,
    });

    const circle =
      point.name === "pass"
        ? Circle({
            radius: 3,
          })
        : Circle({
            radius: 5,
          });

    const style = ShapeStyle({
      fill: point.name === "pass" ? [0, 0, 25] : [240, 60, 100],
    });

    world.addBundle(
      createBundle([
        circle,
        position,
        style,
        Label({
          text: "point",
        }),
      ]),
    );
  }

  // Shift Lever
  world.addBundle(
    createBundle([
      Position({
        position: canvasBounds.center.center,
      }),
      tag("shift-lever")(),
      Label({
        text: "shift-lever",
      }),
      Circle({
        radius: 15,
      }),
      ShapeStyle({
        fill: [0, 60, 100],
      }),
    ]),
  );
}

function initiateShift(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
  emitter: EventEmitter<{ shift: ShiftEventPayload }>,
  eventPayload: KeypressEvent,
) {
  const dir = keyToDirectionMap.get(eventPayload.key);
  if (!dir) return;

  const currentShiftPosition = state["shift-position"].value;

  const neighbourInDirection = currentShiftPosition.neighborInDirection(dir);

  if (!neighbourInDirection) {
    return;
  }

  emitter.emit({
    event: "shift",
    payload: {
      from: currentShiftPosition,
      to: neighbourInDirection,
    },
  });
}

function releaseShifter(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
  emitter: EventEmitter<{ shift: ShiftEventPayload }>,
  eventPayload: KeypressEvent,
) {
  const dir = keyToDirectionMap.get(eventPayload.key);
  if (!dir) return;

  const currentShiftPosition = state["shift-position"].value;

  if (currentShiftPosition.name === "pass") {
    const neighbourInDirection = currentShiftPosition.neighborInDirection(dir);

    if (!neighbourInDirection) {
      const neutral = commonGate.neutral;

      emitter.emit({
        event: "shift",
        payload: {
          from: currentShiftPosition,
          to: neutral,
        },
      });
    }
  }
}

function completeShift(
  world: World,
  resources: ResourcePool,
  state: {
    "shift-position": State<GateNode>;
    "next-shift-position": State<GateNode | null>;
  },
  emitter: EventEmitter<{ shift: ShiftEventPayload }>,
  animation: AnimationData,
) {
  if (
    animation.target === "shift-lever" &&
    state["next-shift-position"].value
  ) {
    const nextPosition = state["next-shift-position"].value;

    if (!nextPosition) {
      return;
    }
    state["shift-position"].setValue(nextPosition);
    state["next-shift-position"].setValue(null);
  }
}

function chainShift(
  world: World,
  resources: ResourcePool,
  state: {
    "shift-position": State<GateNode>;
    "next-shift-position": State<GateNode | null>;
  },
  emitter: EventEmitter<{ shift: ShiftEventPayload }>,
  animation: AnimationData,
) {
  const p = resources.get<p5>("p5");

  if (animation.target === "shift-lever") {
    // add support for event triggers to be conditional on the payload
    const currentShiftPosition = state["shift-position"].value;

    const pressedKey = p.key;
    const pressedDir = keyToDirectionMap.get(pressedKey);

    // Set shifter back to neutral if the user doesn't have key down in direction of the next node when current node is a pass.

    let nextPosition: GateNode | undefined =
      currentShiftPosition.name === "pass" ? commonGate.neutral : undefined;

    if (pressedDir) {
      nextPosition = currentShiftPosition.neighborInDirection(pressedDir);
    }

    if (nextPosition) {
      emitter.emit({
        event: "shift",
        payload: {
          from: currentShiftPosition,
          to: nextPosition,
        },
      });
    }
  }
}

function moveShifter(
  world: World,
  resources: ResourcePool,
  state: { "next-shift-position": State<GateNode | null> },
  emitter: unknown,
  { from, to }: { from: GateNode; to: GateNode },
) {
  if (state["next-shift-position"].value === null) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    const shifterAnimation = createAnimation({
      name: "shift-lever-animation",
      from: from.position.plus(canvasBounds.center.center),
      to: to.position.plus(canvasBounds.center.center),
      target: "shift-lever",
      duration: 120,
      loop: false,
      startTime: Date.now(),
    });

    world.addBundle(shifterAnimation);
    state["next-shift-position"].setValue(to);
  }
}

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
    .event<"animation:started", AnimationData>("animation:started")
    .event<"animation:completed", AnimationData>("animation:completed")
    .event<"shift", ShiftEventPayload>("shift")
    .state<"shift-position", GateNode>("shift-position", commonGate.neutral)
    .state<"next-shift-position", GateNode | null>("next-shift-position", null)
    .build();

  const t = engine.trigger;

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(gearText());
  engine.part(animation());
  engine.part(inspector());

  engine.system("setupGate", t.on("setup"), buildGate);

  engine.system("initiate-shift", t.on("keyPressed"), initiateShift);
  engine.system("relase-shifter", t.on("keyReleased"), releaseShifter);
  engine.system("complete-shift", t.on("animation:completed"), completeShift);
  engine.system("chain-shift", t.on("animation:completed"), chainShift);
  engine.system("move-shifter", t.on("shift"), moveShifter);

  return engine;
}
