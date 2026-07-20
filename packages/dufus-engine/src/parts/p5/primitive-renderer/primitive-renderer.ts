import p5 from "p5";
import World from "../../../core/World/World";
import { Color, ShapeStyle } from "./ShapeStyle";
import { Circle, Line, Square, Text } from "../shape-components";
import { ResourcePool } from "../../../core/Engine/ResourcePool";
import { Position, PositionData } from "../../../components";

function toP5Color(p: p5, color: string | number[]) {
  if (typeof color === "string") {
    return p.color(color);
  }
  return p.color(color);
}

function drawCircle(p: p5, position: PositionData, radius: number) {
  p.circle(position.position.x, position.position.y, radius * 2);
}

function drawLine(
  p: p5,
  position: PositionData,
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  p.line(
    start.x + position.position.x,
    start.y + position.position.y,
    end.x + position.position.x,
    end.y + position.position.y,
  );
}

function drawSquare(
  p: p5,
  position: PositionData,
  width: number,
  height: number,
  borderRadius?: number,
) {
  p.rect(
    position.position.x,
    position.position.y,
    width,
    height,
    borderRadius ?? 0,
  );
}

function drawText(
  p: p5,
  position: PositionData,
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

  p.text(text, position.position.x, position.position.y);
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

    const square = entity.getComponent(Square);
    if (square) {
      drawSquare(
        p,
        position.componentData,
        square.componentData.width,
        square.componentData.height,
        square.componentData.borderRadius,
      );
    }

    const line = entity.getComponent(Line);
    if (line) {
      drawLine(
        p,
        position.componentData,
        line.componentData.start,
        line.componentData.end,
      );
    }

    const circle = entity.getComponent(Circle);
    if (circle) {
      drawCircle(p, position.componentData, circle.componentData.radius);
    }

    const text = entity.getComponent(Text);
    if (text) {
      drawText(
        p,
        position.componentData,
        text.componentData.text,
        text.componentData.size,
        text.componentData.align,
        text.componentData.font,
      );
    }
    p.pop();
  }
}

export default primitiveRendererSystem;
