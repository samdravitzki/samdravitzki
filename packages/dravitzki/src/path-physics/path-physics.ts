import {
  dufus,
  World,
  ResourcePool,
  Bounds,
  Vector,
  Position,
  component,
  createBundle,
  Label,
  Rotation,
} from "@dravitzki/dufus-engine";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import { p5Part, ShapeStyle, Square } from "@dravitzki/dufus-engine/parts/p5";
import { pathEdge, pathNode } from "../coin-game/prefabs/path";

export function thing(position: Vector, size: number) {
  // TODO: rename bundles to prefabs, that you add to the world by calling world.add(prefab)
  return createBundle([
    Position({
      position: position,
    }),
    Rotation({
      rotation: 0,
    }),
    Square({
      width: size,
      height: size,
    }),
    ShapeStyle({
      fill: "#DAA520",
      strokeWeight: 2,
    }),
    Label({
      text: "square",
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

const GRAVITY = new Vector(0, 9.8);
export const Velocity = component<Vector>({ name: "velocity" });
export const AngularVelocity = component<number>({ name: "angular-velocity" });

function setupPath(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const startingPoint = canvasBounds.shrink(20).center.top;

  const [nodes, edges] = path(startingPoint)
    .next(new Vector(0, 150))
    .next(new Vector(40, 150))
    .next(new Vector(0, 150))
    .create();

  for (const node of nodes) {
    world.addBundle(pathNode(node));
  }

  for (const [start, end] of edges) {
    world.addBundle(pathEdge(start, end));
  }

  world.addBundle(
    createBundle([
      ...thing(startingPoint, 20).components,
      Velocity(Vector.create(0, 0.5)),
      AngularVelocity(2),
    ]),
  );
}

export default function pathPhysicsDemo(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"fixed-update", { deltaTime: number }>("fixed-update")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(inspector());

  engine.system("path-physics-setup", engine.trigger.on("setup"), setupPath);

  engine.system(
    "gravity",
    engine.trigger.on("fixed-update"),
    (world, resources, state, eventEmitter, payload) => {
      for (const [vel] of world.query([Velocity, Position])) {
        const gravity = GRAVITY.times(payload.deltaTime / 1000);

        vel.componentData = vel.componentData.plus(gravity);
      }
    },
  );

  engine.system(
    "physics",
    engine.trigger.on("fixed-update"),
    (world, resources, state, eventEmitter, payload) => {
      for (const [pos, vel, rot, angVel] of world.query([
        Position,
        Velocity,
        Rotation,
        AngularVelocity,
      ])) {
        pos.componentData.position = pos.componentData.position.plus(
          vel.componentData.times(payload.deltaTime / 1000),
        );

        rot.componentData.rotation =
          rot.componentData.rotation +
          angVel.componentData * (payload.deltaTime / 1000);
      }
    },
  );

  return engine;
}
