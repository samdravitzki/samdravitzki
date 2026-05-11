import p5 from "p5";
import World from "../../../core/World/World";
import { Position } from "../../../components/Position";
import {
  PrimitiveShape,
  Color,
  ShapeStyle,
  Square,
  Line,
  Text,
} from "./components/Primitive";
import { ResourcePool } from "../../../core/Engine/ResourcePool";

function toP5Color(p: p5, color: string | number[]) {
  if (typeof color === "string") {
    return p.color(color);
  }
  return p.color(color);
}

function drawCircle(p: p5, position: Position, radius: number) {
  p.circle(position.position.x, position.position.y, radius * 2);
}

function drawLine(
  p: p5,
  position: Position,
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
  position: Position,
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
  position: Position,
  text: string,
  size: number,
  align?: "left" | "right" | "center",
  font?: string,
) {
  p.textSize(size);

  if (align === "left") p.textAlign(p.LEFT);
  if (align === "right") p.textAlign(p.RIGHT);
  if (!align || align === "center") p.textAlign(p.CENTER);

  p.text(text, position.position.x, position.position.y);

  if (font) {
    p.textFont(font);
  }
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
  const oldPrimitiveShapes = world.query<[Position, PrimitiveShape]>([
    "position",
    "primitive",
  ]);

  const p = resources.get<p5>("p5");

  for (const [position, primitive] of oldPrimitiveShapes) {
    applyPrimitiveStyle(p, {
      stroke: primitive.stroke,
      strokeWeight: primitive.strokeWeight,
      fill: primitive.fill === false ? undefined : primitive.fill,
      dash: primitive.dash,
      dashOffset: primitive.dashOffset,
    });

    if (primitive.type === "circle") {
      drawCircle(p, position, primitive.radius);
    }

    if (primitive.type === "line") {
      drawLine(p, position, primitive.start, primitive.end);
    }

    if (primitive.type === "square") {
      drawSquare(
        p,
        position,
        primitive.width,
        primitive.height,
        primitive.borderRadius,
      );
    }

    if (primitive.type === "text") {
      drawText(
        p,
        position,
        primitive.text,
        primitive.size,
        primitive.align,
        primitive.font,
      );
    }
  }

  const squares = world.query<[string, Position, ShapeStyle]>([
    "entity-id",
    "position",
    "shape-style",
  ]);

  for (const [entityId, position, style] of squares) {
    applyPrimitiveStyle(p, style);

    const entity = world.entity(entityId);

    if (entity.hasComponent("square")) {
      const square = entity.getComponent("square") as Square;
      drawSquare(p, position, square.width, square.height, square.borderRadius);
    }

    if (entity.hasComponent("line")) {
      const line = entity.getComponent("line") as Line;
      drawLine(p, position, line.start, line.end);
    }

    if (entity.hasComponent("circle")) {
      const circle = entity.getComponent("circle") as {
        name: "circle";
        radius: number;
      };
      drawCircle(p, position, circle.radius);
    }

    if (entity.hasComponent("text")) {
      const text = entity.getComponent("text") as Text;
      drawText(
        p,
        position,
        text.text,
        text.size,
        text.align,
        text.font,
      );
    }
  }
}

export default primitiveRendererSystem;
