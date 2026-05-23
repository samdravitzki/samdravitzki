import p5 from "p5";
import { ResourcePool } from "../../../core/Engine/ResourcePool";
import World from "../../../core/World/World";
import { Position } from "../../../components/Position";
import { Circle, Square } from "../shape-components";
import Bounds from "../../../core/Bounds/Bounds";
import sdf from "../../../../sdf/sdf";
import State from "../../../core/State/State";
import Component from "../../../core/Component/Component";
import { Color } from "../primitive-renderer/ShapeStyle";

export type SdfShape = Component & {
  name: "sdf-shape";
  fill: number[];
};

let vertSrc = `
precision highp float;

attribute vec3 aPosition;

// The transform of the object being drawn
uniform mat4 uModelViewMatrix;
// Transforms 3D coordinates to
// 2D screen coordinates
uniform mat4 uProjectionMatrix;

void main() {
   // Apply the camera transform
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);

  // Tell WebGL where the vertex goes
  gl_Position = uProjectionMatrix * viewModelPosition;
}
`;

// based on https://www.shadertoy.com/view/X3j3Wd
let fragSrc = `
precision highp float;

const int MAX_SHAPE_COUNT = 128;
uniform int u_shape_types[MAX_SHAPE_COUNT];
uniform vec2 u_shape_pos[MAX_SHAPE_COUNT];
uniform vec2 u_shape_size[MAX_SHAPE_COUNT];
uniform vec3 u_shape_fill[MAX_SHAPE_COUNT];
uniform int u_shape_count;
uniform bool u_debug;

float sdCircle(vec2 p, float radius) {
    return length(p) - radius;
}

float sdBox(vec2 p, vec2 size) {
    vec2 d = abs(p) - size;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1. - h);
}

const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 YELLOW_DARK = vec4(1.0, 0.79, 0.22, 1.0);
const vec4 YELLOW_LIGHT = vec4(1.0, 0.88, 0.4, 1.0);
const vec4 BLUE_DARK = vec4(0.54, 0.79, 1.0, 1.0);
const vec4 BLUE_LIGHT = vec4(0.76, 0.89, 1.0, 1.0);
const vec4 TRANSPARENT = vec4(0, 0, 0, 0);

void main() {
  float frag = 99999999.0;
  vec3 fillAcc = vec3(0.0);

  for (int i = 0; i < MAX_SHAPE_COUNT; i++) {
    if (i > u_shape_count - 1) { break; }

    int type = u_shape_types[i];
    vec2 pos = u_shape_pos[i];
    vec2 size = u_shape_size[i];
    vec3 fill = u_shape_fill[i];

    float shape = 0.0;

    if (type == 0) {
      shape = sdCircle(pos - gl_FragCoord.xy, size.x);
    }

    if (type == 1) {
      shape = sdBox(pos - gl_FragCoord.xy, size);
    }


    float weight = 100.0;

    float h = clamp(0.5 + 0.5 * (shape - frag) / weight, 0.0, 1.0);

    frag = mix(shape, frag, h) - weight * h * (1.0 - h);

    fillAcc = mix(fill, fillAcc, h);
  }

  float insideMask = 1.0 - step(0.0, frag);

  if (u_debug) {
    float fragRes = floor(abs(mod(0.15*frag, 2.0)-1.0) + 0.5);
    vec4 insideColor = mix(BLUE_LIGHT, BLUE_DARK, abs(fragRes));
    vec4 outsideColor = mix(YELLOW_LIGHT, YELLOW_DARK, fragRes);
    gl_FragColor = mix(outsideColor, insideColor, insideMask);
  } else {
    gl_FragColor = mix(TRANSPARENT, vec4(fillAcc, 1.0), insideMask);
  }

  float outlineMask = 1.0 - smoothstep(1.0, 2.0, abs(frag));
  gl_FragColor = mix(gl_FragColor, RED, outlineMask);

}`;

function sdfRendererSetupSystem(world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const sdfShader = p.createShader(vertSrc, fragSrc);
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

    shapeFill.push([sdfShape.fill[0], sdfShape.fill[1], sdfShape.fill[2]]);

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

  sdfShader.setUniform("u_shape_types", shapeType);
  sdfShader.setUniform("u_shape_pos", shapePos.flat());
  sdfShader.setUniform("u_shape_size", shapeSize.flat());
  sdfShader.setUniform("u_shape_fill", shapeFill.flat());
  sdfShader.setUniform("u_shape_count", shapeType.length);
  sdfShader.setUniform("u_debug", state["sdf-renderer:debug"].value);

  sdfBuffer.background(0, 0);
  sdfBuffer.rect(
    -bufferWidth / 2,
    -bufferHeight / 2,
    bufferWidth,
    bufferHeight,
  );

  p.image(sdfBuffer, 0, 0);
}

export default sdfRendererSystem;
export { sdfRendererSetupSystem };
