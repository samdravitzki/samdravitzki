import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import State from "../ecs/core/State/State";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import p5Part, { KeypressEvent } from "../ecs/parts/p5/p5-part";
import { PrimitiveShape } from "../ecs/parts/p5/primitive-renderer/components/Primitive";
import GateNode, {
  commonGate,
  shortestPath,
  Direction,
  furtherestNodeInDirection,
} from "./gate";
import Path from "./Path";

function setupGate(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  for (const point of Object.values(commonGate)) {
    const pos = point.position.times(2).plus(canvasBounds.center.center);

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

function setupGearText(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const text: PrimitiveShape = {
    name: "primitive",
    fill: [240, 60, 100, 255],
    type: "text",
    text: state["shift-position"].value.name,
    align: "center",
    size: 20,
  };

  const position: Position = {
    name: "position",
    position: canvasBounds.center.top.plus(Vector.create(0, 50)),
  };

  world.addBundle(createBundle(["gear-text", text, position]));
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

const HOLD_THRESHOLD = 150;

function shiftGearSystem(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
  emitter: unknown,
  eventPayload: KeyHoldReleasedEvent,
) {
  const dir = keyToDirectionMap.get(eventPayload.key);
  if (!dir) return;

  const currentShiftPosition = state["shift-position"].value;

  const neighbourInDirection = currentShiftPosition.neighbours.find(
    (neighbour) => neighbour.dir === dir,
  );

  if (!neighbourInDirection) {
    return;
  }

  if (
    currentShiftPosition.name === "neutral" ||
    currentShiftPosition.name === "pass"
  ) {
    state["shift-position"].setValue(neighbourInDirection.node);
    return;
  }

  if (eventPayload.duration <= HOLD_THRESHOLD) {
    const nodes = shortestPath(currentShiftPosition, commonGate.neutral);
    const path = new Path(nodes.map((node) => node.position));

    const newShiftPosition = nodes[nodes.length - 1];
    state["shift-position"].setValue(newShiftPosition);
  } else {
    const nodes = furtherestNodeInDirection(currentShiftPosition, dir);
    const newShiftPosition = nodes[nodes.length - 1];
    state["shift-position"].setValue(newShiftPosition);
  }
}

function currentGearDisplay(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
) {
  const [gearText] = world.query<[PrimitiveShape]>([
    "primitive",
    "gear-text",
  ])[0];

  if (gearText.type === "text") {
    gearText.text = state["shift-position"].value.name;
  }
}

/**
 * Map of keys currently being held down
 * A
 */
type HeldKeys = Record<string, number>;

type KeyHoldReleasedEvent = KeypressEvent & { duration: number };

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
    .event<"keyHoldReleased", KeyHoldReleasedEvent>("keyHoldReleased")
    .event("after-update")
    .state<"shift-position", GateNode>("shift-position", commonGate.neutral)
    .state<"held-keys", HeldKeys>("held-keys", {})
    .build();

  const t = engine.trigger;

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));

  engine.system("setupGate", t.on("setup"), setupGate);
  engine.system("setupGearText", t.on("setup"), setupGearText);

  engine.system("shift-gear", t.on("keyHoldReleased"), shiftGearSystem);

  engine.system("move-shifter", t.on("update"), (world, resources, state) => {
    const [leverPosition] = world.query<[Position]>([
      "position",
      "shift-lever",
    ])[0];

    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    const newLeverPos = state["shift-position"].value.position
      .times(2)
      .plus(canvasBounds.center.center);

    leverPosition.position = newLeverPos;
  });

  engine.system("display-gear", t.on("update"), currentGearDisplay);

  engine.system(
    "clear-path-visualisation",
    t.on("keyHoldReleased"),
    (world) => {
      for (const [entityId] of world.query<[string, string]>([
        "entity-id",
        "path-vis",
      ])) {
        world.removeEntity(entityId);
      }
    },
  );

  engine.system(
    "visualise-path-home",
    t.on("keyPressed"),
    (world, resources, state, emitter, eventPayload) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");
      const currentShiftPosition = state["shift-position"].value;

      const pathHome = new Path(
        shortestPath(currentShiftPosition, commonGate.neutral).map(
          (node) => node.position,
        ),
      );

      for (const edge of pathHome.edges()) {
        world.addBundle(
          createBundle([
            "path-vis",
            {
              name: "position",
              position: canvasBounds.center.center,
            },
            {
              name: "primitive",
              type: "line",
              start: edge.start.times(2),
              end: edge.end.times(2),
              stroke: [125, 99, 99],
              strokeWeight: 2,
              fill: false,
            } satisfies PrimitiveShape,
          ]),
        );
      }
    },
  );

  engine.system(
    "visualise-futherest-path-in-dir",
    t.on("keyPressed"),
    (world, resources, state, emitter, eventPayload) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");
      const currentShiftPosition = state["shift-position"].value;

      const dir = keyToDirectionMap.get(eventPayload.key);
      if (!dir) return;

      const pathInDir = new Path(
        furtherestNodeInDirection(currentShiftPosition, dir).map(
          (node) => node.position,
        ),
      );

      for (const edge of pathInDir.edges()) {
        world.addBundle(
          createBundle([
            "path-vis",
            {
              name: "position",
              position: canvasBounds.center.center,
            },
            {
              name: "primitive",
              type: "line",
              start: edge.start.times(2),
              end: edge.end.times(2),
              stroke: [294, 99, 99],
              strokeWeight: 2,
              dash: [5, 10],
              fill: false,
            } satisfies PrimitiveShape,
          ]),
        );
      }
    },
  );

  engine.system(
    "key-hold-press-detector",
    t.on("keyPressed"),
    (world, resources, state, emitter, eventPayload) => {
      const heldKeys = state["held-keys"];
      if (Object.keys(heldKeys.value).includes(eventPayload.key)) {
        return;
      }

      heldKeys.setValue({
        ...heldKeys.value,
        [eventPayload.key]: Date.now(),
      });
    },
  );

  engine.system(
    "key-hold-release-detector",
    t.on("keyReleased"),
    (world, resources, state, emitter, eventPayload) => {
      const { [eventPayload.key]: releasedKeyPressTime, ...otherKeys } =
        state["held-keys"].value;

      const holdDuration = Date.now() - releasedKeyPressTime;

      state["held-keys"].setValue(otherKeys);

      emitter.emit({
        event: "keyHoldReleased",
        payload: {
          ...eventPayload,
          duration: holdDuration,
        },
      });
    },
  );

  return engine;
}
