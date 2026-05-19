import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { EntityId } from "../ecs/core/Entity/Entity";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import p5Part, { KeypressEvent, MousePosition } from "../ecs/parts/p5/p5-part";
import { MousepressEvent } from "../ecs/parts/p5/p5-setup";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import sdfRendererPart from "../ecs/parts/p5/sdf-renderer/sdf-renderer-part";
import { Square } from "../ecs/parts/p5/shape-components";
import { Circle } from "../ecs/parts/p5/shape-components";

const baseShapeComponents = [
  "sdf-shape",
  {
    name: "shape-style",
    stroke: "#ffffff78",
    strokeWeight: 3,
    dash: [10, 15],
  } satisfies ShapeStyle,
];

function sdfShapes(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const circle = createBundle([
    {
      name: "position",
      position: canvasBounds.bottom.right.minus(Vector.create(200, 200)),
    } satisfies Position,
    {
      name: "circle",
      radius: 75,
    } satisfies Circle,
    ...baseShapeComponents,
  ]);

  const square = createBundle([
    {
      name: "position",
      position: canvasBounds.top.left.plus(Vector.create(200, 200)),
    } satisfies Position,
    {
      name: "square",
      width: 150,
      height: 150,
    } satisfies Square,
    ...baseShapeComponents,
  ]);

  world.addBundle(circle);
  world.addBundle(square);
}

export default function sdf(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .event<"mousePressed", MousepressEvent>("mousePressed")
    .event<"mouseReleased", MousepressEvent>("mouseReleased")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(sdfRendererPart());

  engine.system("sdf-shapes", engine.trigger.on("setup"), sdfShapes);
  engine.system(
    "create-interactive-shape",
    engine.trigger.on("mousePressed"),
    (world, resources) => {
      const mousePosition = resources.get<MousePosition>("mouse-position");
      const circle = createBundle([
        "interactive-shape",
        {
          name: "position",
          position: Vector.create(mousePosition.x, mousePosition.y),
        } satisfies Position,
        {
          name: "circle",
          radius: 75,
        } satisfies Circle,
        ...baseShapeComponents,
      ]);

      world.addBundle(circle);
    },
  );

  engine.system(
    "move-interactive-shape",
    engine.trigger.on("update"),
    (world, resources) => {
      const mousePosition = resources.get<MousePosition>("mouse-position");
      const interactiveShape = world.query<[Position]>([
        "position",
        "interactive-shape",
      ])[0];

      if (!interactiveShape) {
        return;
      }

      const [position] = interactiveShape;

      position.position = Vector.create(mousePosition.x, mousePosition.y);
    },
  );

  engine.system(
    "remove-interactive-shape",
    engine.trigger.on("mouseReleased"),
    (world) => {
      const [entityId] = world.query<[EntityId]>([
        "entity-id",
        "interactive-shape",
      ])[0];

      world.removeEntity(entityId);
    },
  );

  return engine;
}
