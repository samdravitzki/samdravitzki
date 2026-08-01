import {
  dufus,
  World,
  ResourcePool,
  Bounds,
  createBundle,
  Position,
  Label,
  Vector,
} from "@dravitzki/dufus-engine";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import {
  Circle,
  p5Part,
  ShapeStyle,
  Square,
  Typography,
} from "@dravitzki/dufus-engine/parts/p5";
import { coin } from "./prefabs/coin";
import { pathEdge, pathNode } from "./prefabs/path";

/**
 * Coin game - based off the games add fish and chip shops
 *
 * Each day you are given three coins, get the coin to the goal and you get
 * to add it to your collection. If you drop it, you lose it
 */

function label(text: string, position: Vector) {
  return createBundle([
    Position({
      position: position,
    }),
    Label({
      text: `${text} label`,
    }),
    Typography({
      text: text,
      size: 16,
      align: "center",
      font: "monospace",
    }),
    ShapeStyle({
      fill: "#fff",
    }),
  ]);
}

/**
 * Path builder
 * path(start).next((new Vector()).next(new Vector()).build() => nodes and edges
 *
 */
const path = (start: Vector) => {
  const nodes: Vector[] = [start];

  type Nodes = Vector[];
  type Edges = [Vector, Vector][];

  type Result = [Nodes, Edges];

  const calcEdges = (nodes: Nodes): Edges => {
    const edges: Edges = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push([nodes[i], nodes[i + 1]]);
    }
    return edges;
  };

  const nextFunc = (next: Vector) => {
    const nextVec = nodes[nodes.length - 1].plus(next);

    nodes.push(nextVec);
    return {
      next: nextFunc,
      create: (): Result => [nodes, calcEdges(nodes)],
    };
  };

  return {
    next: nextFunc,
  };
};

function setupGame(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const coinSize = 10;
  const coinSpacing = coinSize * 2 + 5;

  for (let i = 0; i < 3; i++) {
    const offset = coinSpacing * i;
    world.addBundle(
      coin(
        canvasBounds.top.left.minus(new Vector(-50 - offset, -50)),
        coinSize,
      ),
    );
  }

  world.addBundle(
    label("Drop here", canvasBounds.top.right.plus(new Vector(-100, 50))),
  );

  world.addBundle(
    label("Goal", canvasBounds.bottom.right.minus(new Vector(140, 50))),
  );
  world.addBundle(
    label("Coins", canvasBounds.top.left.plus(new Vector(50, 20))),
  );

  const entry = canvasBounds.top.right.plus(new Vector(-100, 80));
  const exit = canvasBounds.bottom.right.minus(new Vector(140, 80));

  const xmax = 450;
  const xmin = 20;

  const [level1, level1Edges] = path(new Vector(xmax, 180))
    .next(new Vector(-275, -50))
    .next(new Vector(-125, 10))
    .create();

  const [level2, level2Edges] = path(new Vector(xmin, 250))
    .next(new Vector(300, -40))
    .next(new Vector(100, 50))
    .create();

  const [level3, level3Edges] = path(new Vector(xmax, 330))
    .next(new Vector(-150, -20))
    .next(new Vector(-50, 20))
    .next(new Vector(-75, -25))
    .next(new Vector(-125, 30))
    .create();

  const [level4, level4Edges] = path(new Vector(xmin, 430))
    .next(new Vector(280, -40))
    .next(new Vector(120, 40))
    .create();

  const [level5, level5Edges] = path(new Vector(xmax, 500))
    .next(new Vector(-150, -20))
    .next(new Vector(-80, 20))
    .next(new Vector(-75, -35))
    .next(new Vector(-100, 40))
    .create();

  const [level6, level6Edges] = path(new Vector(xmin, 600))
    .next(new Vector(150, -10))
    .next(new Vector(150, -40))
    .next(new Vector(100, 40))
    .create();

  const nodes = [
    entry,
    ...level1,
    ...level2,
    ...level3,
    ...level4,
    ...level5,
    ...level6,
    exit,
  ];

  for (const node of nodes) {
    world.addBundle(pathNode(node));
  }

  const edges = [
    ...level1Edges,
    ...level2Edges,
    ...level3Edges,
    ...level4Edges,
    ...level5Edges,
    ...level6Edges,
  ];

  for (const [start, end] of edges) {
    world.addBundle(pathEdge(start, end));
  }
}

export default function coinGame(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 750], parent, "#2625274d"));
  engine.part(inspector());

  engine.system("template-info", engine.trigger.on("setup"), setupGame);

  return engine;
}
