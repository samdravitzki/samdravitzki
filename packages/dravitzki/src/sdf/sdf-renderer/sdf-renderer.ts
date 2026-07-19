import p5 from "p5";
import { ResourcePool } from "@samdravitzki/dufus-engine/src/core/Engine/ResourcePool";
import World from "@samdravitzki/dufus-engine/src/core/World/World";
import Position from "@samdravitzki/dufus-engine/src/components/Position";
import {
  Circle,
  Square,
} from "@samdravitzki/dufus-engine/src/parts/p5/shape-components";
import Bounds from "@samdravitzki/dufus-engine/src/core/Bounds/Bounds";
import State from "@samdravitzki/dufus-engine/src/core/State/State";
import { component } from "@samdravitzki/dufus-engine/src/core/Component/Component";
import vert from "./shader/shader.vert?raw";
import frag from "./shader/shader.frag?raw";

// export type SdfShape = Component & {
//   name: "sdf-shape";
//   fill: number[];
// };

export const SdfShape = component<{
  fill: number[];
}>({ name: "sdf-shape" });

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
    "sdf-renderer:enabled": State<boolean>;
  },
) {
  if (!state["sdf-renderer:enabled"].value) return;

  const p = resources.get<p5>("p5");
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const scale = p.pixelDensity();
  const bufferWidth = canvasBounds.width * scale;
  const bufferHeight = canvasBounds.width * scale;

  const sdfShader = resources.get<p5.Shader>("sdf-shader");
  const sdfBuffer = resources.get<p5.Graphics>("sdf-buffer");

  const shapes = world.query(["entity-id", Position, SdfShape]);

  sdfBuffer.shader(sdfShader);

  const shapeType: number[] = [];
  const shapePos: [number, number][] = [];
  const shapeSize: [number, number][] = [];
  const shapeFill: [number, number, number][] = [];

  for (const [entityId, position, sdfShape] of shapes) {
    const entity = world.entity(entityId);

    shapeFill.push([
      sdfShape.componentData.fill[0] / 255,
      sdfShape.componentData.fill[1] / 255,
      sdfShape.componentData.fill[2] / 255,
    ]);

    const circle = entity.getComponent(Circle);
    if (circle) {
      const type = 0;
      // Not sure why the positions have to be doulbed
      const x = position.componentData.position.x * scale;
      const y = bufferHeight - position.componentData.position.y * scale;

      const radius = circle.componentData.radius * scale;

      shapeType.push(type);
      shapePos.push([x, y]);
      shapeSize.push([radius, 0]);
    }

    const square = entity.getComponent(Square);
    if (square) {
      const type = 1;
      // Need to figure out the transformations, the WEBGL centering needs to be considered
      const x = position.componentData.position.x * scale;
      const y = bufferHeight - position.componentData.position.y * scale;
      const sizeX = square.componentData.width * scale;
      const sizeY = square.componentData.height * scale;

      shapeType.push(type);
      shapePos.push([x, y]);
      shapeSize.push([sizeX / 2, sizeY / 2]);
    }
  }

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
