import { Vector } from "../../../core";
import { Circle } from "./intersection-shapes";

type CircleCircleIntersection = {
  contactPoint: Vector;
  normal: Vector;
  penetration: number;
};

// https://research.ncl.ac.uk/game/mastersdegree/gametechnologies/physicstutorials/4collisiondetection/Physics%20-%20Collision%20Detection.pdf
export function cirlceCirlceIntersection(
  circle1: Circle,
  circle2: Circle,
): CircleCircleIntersection | null {
  const deltaPosition = circle2.position.minus(circle1.position);

  const combinedRadius = circle1.radius + circle2.radius;

  if (deltaPosition.length() < combinedRadius) {
    const normal = deltaPosition.normalised();
    const penetration = combinedRadius - deltaPosition.length();
    const contactPoint = normal.times(circle1.radius);

    return {
      contactPoint,
      normal,
      penetration,
    };
  }

  return null;
}
