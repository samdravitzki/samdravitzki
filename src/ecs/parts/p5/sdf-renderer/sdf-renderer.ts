import p5 from "p5";
import { ResourcePool } from "../../../core/Engine/ResourcePool";
import World from "../../../core/World/World";
import { Position } from "../../../components/Position";
import { Circle, Square } from "../shape-components";
import Bounds from "../../../core/Bounds/Bounds";
import State from "../../../core/State/State";
import Component from "../../../core/Component/Component";
import vert from "./shader/shader.vert?raw";
import frag from "./shader/shader.frag?raw";

export type SdfShape = Component & {
  name: "sdf-shape";
  fill: number[];
};

function sdfRendererSetupSystem(world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const sdfShader = p.createShader(vert, frag);

  const sdfBuffer = p.createGraphics(
    canvasBounds.width,
    canvasBounds.height,
    p.WEBGL,
  );

  resources.set("sdf-shader", sdfShader);
  resources.set("sdf-buffer", sdfBuffer);
}

function sdfRendererSystem(
  world: World,
  resources: ResourcePool,
  state: {
    "sdf-renderer:debug": State<boolean>;
  },
) {
  const p = resources.get<p5>("p5");
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const scale = p.pixelDensity();
  const bufferWidth = canvasBounds.width * scale;
  const bufferHeight = canvasBounds.width * scale;

  const sdfShader = resources.get<p5.Shader>("sdf-shader");
  const sdfBuffer = resources.get<p5.Graphics>("sdf-buffer");

  const shapes = world.query<[string, Position, SdfShape]>([
    "entity-id",
    "position",
    "sdf-shape",
  ]);

  sdfBuffer.shader(sdfShader);

  const shapeType: number[] = [];
  const shapePos: [number, number][] = [];
  const shapeSize: [number, number][] = [];
  const shapeFill: [number, number, number][] = [];

  for (const [entityId, position, sdfShape] of shapes) {
    const entity = world.entity(entityId);

    shapeFill.push([
      sdfShape.fill[0] / 255,
      sdfShape.fill[1] / 255,
      sdfShape.fill[2] / 255,
    ]);

    if (entity.hasComponent("circle")) {
      const circle = entity.getComponent("circle") as Circle;

      const type = 0;
      // Not sure why the positions have to be doulbed
      const x = position.position.x * scale;
      const y = bufferHeight - position.position.y * scale;

      const radius = circle.radius * scale;

      shapeType.push(type);
      shapePos.push([x, y]);
      shapeSize.push([radius, 0]);
    }

    if (entity.hasComponent("square")) {
      const square = entity.getComponent("square") as Square;

      const type = 1;
      // Need to figure out the transformations, the WEBGL centering needs to be considered
      const x = position.position.x * scale;
      const y = bufferHeight - position.position.y * scale;
      const sizeX = square.width * scale;
      const sizeY = square.height * scale;

      shapeType.push(type);
      shapePos.push([x, y]);
      shapeSize.push([sizeX / 2, sizeY / 2]);
    }
  }

  // console.log("u_shape_fill", shapeFill.flat());

  sdfShader.setUniform("u_shape_types", shapeType);
  sdfShader.setUniform("u_shape_pos", shapePos.flat());
  sdfShader.setUniform("u_shape_size", shapeSize.flat());
  sdfShader.setUniform("u_shape_fill", shapeFill.flat());
  sdfShader.setUniform("u_shape_count", shapeType.length);
  sdfShader.setUniform("u_debug", state["sdf-renderer:debug"].value);

  sdfBuffer.background(0, 0);

  const padding = 10;

  sdfBuffer.rect(
    -(bufferWidth / 2 + padding),
    -(bufferHeight / 2 + padding),
    bufferWidth + padding * 2,
    bufferHeight + padding * 2,
  );

  p.image(sdfBuffer, 0, 0);
}

export default sdfRendererSystem;
export { sdfRendererSetupSystem };
