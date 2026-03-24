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

type ShiftPosition =
  | "neutral"
  | "1st"
  | "2nd"
  | "3rd"
  | "4th"
  | "5th"
  | "reverse"
  | "pass";

type Direction = "up" | "down" | "left" | "right";

type Neighbour = {
  dir: Direction;
  node: Node;
};

class Node {
  neighbours: Readonly<Neighbour>[] = [];

  constructor(
    public readonly name: ShiftPosition,
    public readonly position: Vector,
  ) {}

  toString() {
    return this.name;
  }
}
const first = new Node("1st", Vector.create(-30, -50));
const second = new Node("2nd", Vector.create(-30, 50));
const passLeft = new Node("pass", Vector.create(-30, 0));
const third = new Node("3rd", Vector.create(0, -50));
const fourth = new Node("4th", Vector.create(0, 50));
const fifth = new Node("5th", Vector.create(30, -50));
const reverse = new Node("reverse", Vector.create(30, 50));
const passRight = new Node("pass", Vector.create(30, 0));
const neutral = new Node("neutral", Vector.create(0, 0));

first.neighbours.push({ dir: "down", node: passLeft });
second.neighbours.push({ dir: "up", node: passLeft });
third.neighbours.push({ dir: "down", node: neutral });
fourth.neighbours.push({ dir: "up", node: neutral });
fifth.neighbours.push({ dir: "down", node: passRight });
reverse.neighbours.push({ dir: "up", node: passRight });

passLeft.neighbours.push({ dir: "up", node: first });
passLeft.neighbours.push({ dir: "down", node: second });
passLeft.neighbours.push({ dir: "right", node: neutral });

passRight.neighbours.push({ dir: "up", node: fifth });
passRight.neighbours.push({ dir: "down", node: reverse });
passRight.neighbours.push({ dir: "left", node: neutral });

neutral.neighbours.push({ dir: "up", node: third });
neutral.neighbours.push({ dir: "down", node: fourth });
neutral.neighbours.push({ dir: "left", node: passLeft });
neutral.neighbours.push({ dir: "right", node: passRight });

const shiftPoints: Node[] = [];
shiftPoints.push(neutral);
shiftPoints.push(first);
shiftPoints.push(passLeft);
shiftPoints.push(second);
shiftPoints.push(third);
shiftPoints.push(fourth);
shiftPoints.push(fifth);
shiftPoints.push(passRight);
shiftPoints.push(reverse);

function setupGate(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  for (const point of shiftPoints) {
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
  state: { "shift-position": State<Node> },
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
    .event("after-update")
    .state<"shift-position", Node>("shift-position", neutral)
    .build();

  const t = engine.trigger;

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));

  engine.system("setupGate", t.on("setup"), setupGate);
  engine.system("setupGearText", t.on("setup"), setupGearText);

  engine.system(
    "shift-gear",
    t.on("keyPressed"),
    (world, resources, state, emitter, eventPayload) => {
      const dir = keyToDirectionMap.get(eventPayload.key);
      if (!dir) return;

      const currentNode = state["shift-position"].value;

      const neighbourInDirection = currentNode.neighbours.find(
        (neighbour) => neighbour.dir === dir,
      );

      if (neighbourInDirection) {
        state["shift-position"].setValue(neighbourInDirection.node);
      }
    },
  );

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

  engine.system("display-gear", t.on("update"), (world, resources, state) => {
    const [gearText] = world.query<[PrimitiveShape]>([
      "primitive",
      "gear-text",
    ])[0];

    if (gearText.type === "text") {
      gearText.text = state["shift-position"].value.name;
    }
  });

  return engine;
}
