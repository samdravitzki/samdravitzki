import p5 from "p5";
import World from "../../../core/World/World";
import { Color, ShapeStyle } from "./ShapeStyle";
import { Circle, Line, Square, Typography } from "../shape-components";
import { ResourcePool } from "../../../core/Engine/ResourcePool";
import { Position, Rotation } from "../../../components";
import Vector from "../../../core/Vector/Vector";

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
  position: Vector,
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  p.line(
    start.x + position.x,
    start.y + position.y,
    end.x + position.x,
    end.y + position.y,
  );
}

function drawSquare(
  p: p5,
  position: Vector,
  width: number,
  height: number,
  borderRadius?: number,
) {
  p.rect(position.x, position.y, width, height, borderRadius ?? 0);
}

function drawText(
  p: p5,
  position: Vector,
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

  p.text(text, position.x, position.y);
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

function primitiveRendererSystem(world: World, resources: ResourcePool) {
  const p = resources.get<p5>("p5");

  const shapes = world.query(["entity-id", Position, ShapeStyle]);

  for (const [entityId, position, style] of shapes) {
    p.push();
    applyPrimitiveStyle(p, style.componentData);

    const entity = world.entity(entityId);

    p.translate(
      position.componentData.position.x,
      position.componentData.position.y,
    );

    const rotation = entity.getComponent(Rotation);

    if (rotation) {
      p.rotate(rotation.componentData.rotation);
    }

    const square = entity.getComponent(Square);
    if (square) {
      drawSquare(
        p,
        Vector.create(0, 0),
        square.componentData.width,
        square.componentData.height,
        square.componentData.borderRadius,
      );
    }

    const line = entity.getComponent(Line);
    if (line) {
      drawLine(
        p,
        Vector.create(0, 0),
        line.componentData.start,
        line.componentData.end,
      );
    }

    const circle = entity.getComponent(Circle);
    if (circle) {
      drawCircle(p, Vector.create(0, 0), circle.componentData.radius);
    }

    const text = entity.getComponent(Typography);
    if (text) {
      drawText(
        p,
        Vector.create(0, 0),
        text.componentData.text,
        text.componentData.size,
        text.componentData.align,
        text.componentData.font,
      );
    }

    // p.rotate(0);

    p.pop();
  }
}

export default primitiveRendererSystem;
