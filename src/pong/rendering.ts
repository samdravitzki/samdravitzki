import { Position, PrimitiveShape } from "./components";
import Engine from "./Engine";

function renderingPart<T extends Record<string, unknown>>(engine: Engine<T>) {
  engine.system("renderSystem", { event: "update" }, (world, { p }) => {
    for (const [position, primitive] of world.query<[Position, PrimitiveShape]>(
      ["position", "primitive"]
    )) {
      if (!primitive.strokeWeight) {
        p.strokeWeight(0);
      } else {
        p.strokeWeight(primitive.strokeWeight);
      }

      if (!primitive.stroke) {
        p.noStroke();
      } else {
        p.stroke(primitive.stroke);
      }

      if (!primitive.fill) {
        p.noFill();
      } else {
        p.fill(primitive.fill);
      }

      if (primitive.type === "circle") {
        p.circle(
          position.position.x,
          position.position.y,
          primitive.radius * 2
        );
      }

      if (primitive.type === "line") {
        if (primitive.dash) {
          p.drawingContext.setLineDash(primitive.dash);
        }

        if (primitive.dashOffset) {
          p.drawingContext.lineDashOffset = primitive.dashOffset;
        }

        p.line(
          primitive.start.x + position.position.x,
          primitive.start.y + position.position.y,
          primitive.end.x + position.position.x,
          primitive.end.y + position.position.y
        );

        if (primitive.dash) {
          p.drawingContext.setLineDash([]);
        }

        if (primitive.dashOffset) {
          p.drawingContext.lineDashOffset = 0.0;
        }
      }

      if (primitive.type === "square") {
        p.rect(
          position.position.x,
          position.position.y,
          primitive.width,
          primitive.height
        );
      }

      if (primitive.type === "text") {
        p.textSize(primitive.size);

        if (primitive.align === "left") p.textAlign(p.LEFT);
        if (primitive.align === "right") p.textAlign(p.RIGHT);

        p.text(primitive.text, position.position.x, position.position.y);
      }
    }
  });
}

export default renderingPart;
