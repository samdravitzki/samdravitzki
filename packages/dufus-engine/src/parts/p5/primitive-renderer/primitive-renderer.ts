import p5 from "p5";
import World from "../../../core/World/World";
import { Color, ShapeStyle } from "./ShapeStyle";
import { Circle, Line, Polygon, Square, Typography } from "../shape-components";
import { ResourcePool } from "../../../core/Engine/ResourcePool";
import { ChildOf, getAncestors, Position, Rotation, Scale } from "../../../components";
import Vector from "../../../core/Vector/Vector";
import Matrix3x3 from "../../../core/Matrix3x3/Matrix3x3";

function toP5Color(p: p5, color: string | number[]) {
  if (typeof color === "string") {
    return p.color(color);
  }
  return p.color(color);
}

function drawCircle(p: p5, position: Vector, radius: number) {
  p.circle(position.x, position.y, radius * 2);
}

function drawLine(
  p: p5,
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  p.line(
    start.x,
    start.y,
    end.x,
    end.y,
  );
}

function drawSquare(
  p: p5,
  width: number,
  height: number,
  borderRadius?: number,
) {
  p.rect(0, 0, width, height, borderRadius ?? 0);
}

function drawText(
  p: p5,
  text: string,
  size: number,
  align?: "left" | "right" | "center",
  font?: string,
) {
  if (align === "left") p.textAlign(p.LEFT);
  if (align === "right") p.textAlign(p.RIGHT);
  if (!align || align === "center") p.textAlign(p.CENTER);

  if (font) {
    p.textFont(font);
  }
  p.textSize(size);

  p.text(text, 0, 0);
}

function drawPolygon(p: p5, vertices: Vector[]) {
  p.beginShape();
  for (const vertex of vertices) {
    p.vertex(vertex.x, vertex.y);
  }
  p.endShape(p.CLOSE);
}

function applyPrimitiveStyle(
  p: p5,
  style: {
    stroke?: Color;
    strokeWeight?: number;
    fill?: Color;
    dash?: number[];
    dashOffset?: number;
  },
) {
  if (!style.stroke) {
    p.noStroke();
  } else {
    p.stroke(toP5Color(p, style.stroke));
  }

  if (!style.strokeWeight) {
    p.strokeWeight(0);
  } else {
    p.strokeWeight(style.strokeWeight);
  }

  if (!style.fill) {
    p.noFill();
  } else {
    p.fill(toP5Color(p, style.fill));
  }

  if (style.dash) {
    (p.drawingContext as CanvasRenderingContext2D).setLineDash(style.dash);
  } else {
    (p.drawingContext as CanvasRenderingContext2D).setLineDash([]);
  }

  if (style.dashOffset) {
    (p.drawingContext as CanvasRenderingContext2D).lineDashOffset =
      style.dashOffset;
  } else {
    (p.drawingContext as CanvasRenderingContext2D).lineDashOffset = 0.0;
  }
}


function getModelMatrix(world: World, entityId: string) {
  const entity = world.entity(entityId);
  const posComp = entity.getComponent(Position);
  const rotComp = entity.getComponent(Rotation);

  const pos = posComp?.componentData.position ? posComp.componentData.position : Vector.create(0, 0);
  const rot = rotComp?.componentData.rotation ? rotComp.componentData.rotation : 0;

  const posMatrix = Matrix3x3.fromTranslation(pos);
  const rotMatrix = Matrix3x3.fromRotation(rot);

  const modelMatrix = posMatrix.times(rotMatrix);
  return modelMatrix;
}


function getWorldMatrix(world: World, entityId: string) {

  const modelMatrix = getModelMatrix(world, entityId);

  const worldMatrix = [...getAncestors(world, entityId)].reduce((m, id) => {
   const ancestorModelMatrix = getModelMatrix(world, id);
   return ancestorModelMatrix.times(m);
  }, modelMatrix);

  return worldMatrix;

}


function primitiveRendererSystem(world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");

  const shapes = world.query(["entity-id", ShapeStyle, Position]);

  for (const [entityId, style] of shapes) {
    p.push();
    applyPrimitiveStyle(p, style.componentData);

    const entity = world.entity(entityId);

    const worldMatrix = getWorldMatrix(world, entityId);

    // p5 requires all but final row of the 2d matrix for applyMatrix. 
    // Every third item of the worldMatrix is skipped because glMatrix stores the values as a single array in a column major format.
    // prettier-ignore
    p.applyMatrix(
      worldMatrix.value[0], worldMatrix.value[1], 
      worldMatrix.value[3], worldMatrix.value[4], 
      worldMatrix.value[6], worldMatrix.value[7]
    );

    const scale = entity.getComponent(Scale);

    const square = entity.getComponent(Square);
    if (square) {
      let width = square.componentData.width;
      let height = square.componentData.height;

      if (scale) {
        width *= scale.componentData.x;
        height *= scale.componentData.y;
      }

      drawSquare(
        p,
        width,
        height,
        square.componentData.borderRadius,
      );
    }

    const line = entity.getComponent(Line);
    if (line) {
      let start = line.componentData.start;
      let end = line.componentData.end;

      if (scale) {
        start = Vector.create(
          start.x * scale.componentData.x,
          start.y * scale.componentData.y,
        );
        end = Vector.create(
          end.x * scale.componentData.x,
          end.y * scale.componentData.y,
        );
      }

      drawLine(p, start, end);
    }

    const circle = entity.getComponent(Circle);
    if (circle) {
      let radius = circle.componentData.radius;
      if (scale) {
        radius *= scale.componentData.x; // Assuming uniform scaling for the circle
      }

      drawCircle(p, Vector.create(0, 0), radius);
    }

    const text = entity.getComponent(Typography);
    if (text) {
      let textSize = text.componentData.size;

      if (scale) {
        textSize *= scale.componentData.y; // Assuming uniform scaling for the text
      }

      drawText(
        p,
        text.componentData.text,
        textSize,
        text.componentData.align,
        text.componentData.font,
      );
    }

    const polygon = entity.getComponent(Polygon);

    if (polygon) {
      let verts = polygon.componentData.vertices;

      // Scale this way to preserve shape style i.e. stroke width
      if (scale) {
        verts = verts.map((v) =>
          Vector.create(
            v.x * scale.componentData.x,
            v.y * scale.componentData.y,
          ),
        );
      }

      drawPolygon(p, verts);
    }

    p.pop();
  }
}

export default primitiveRendererSystem;
