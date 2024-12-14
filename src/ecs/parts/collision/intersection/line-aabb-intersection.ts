import Vector from "../../../core/Vector/Vector";
import { Line, Aabb } from "./intersection-shapes";
import lineLineIntersection from "./line-line-intersection";

/**
 * Given a line return the two normal vectors perpendicular to that line
 * @param line
 */
function lineNormals(line: Line): [Vector, Vector] {
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;

  const normal1 = Vector.create(dy === 0 ? 0 : -dy, dx);
  const normal2 = Vector.create(dy, dx === 0 ? 0 : -dx);

  return [normal1.normalised(), normal2.normalised()];
}

type LineAabbIntersection = { contactPoint: Vector; normal: Vector };

/**
 * Given a line and a aabb return the points of intersection between the line and aabb
 * if they are touching. If they are not touching no points of intersection are returned
 *
 * Math from https://www.jeffreythompson.org/collision-detection/line-rect.php where the main difference
 * is here we assume a center positioned aabb
 * @param line
 * @param aabb
 */
function lineAabbIntersection(line: Line, aabb: Aabb): LineAabbIntersection[] {
  // top-left point of aabb
  const topLeft = Vector.create(
    aabb.position.x - aabb.width / 2,
    aabb.position.y - aabb.height / 2
  );

  // top-right point of aabb
  const topRight = Vector.create(
    aabb.position.x + aabb.width / 2,
    aabb.position.y - aabb.height / 2
  );

  // bottom-right point of aabb
  const bottomRight = Vector.create(
    aabb.position.x + aabb.width / 2,
    aabb.position.y + aabb.height / 2
  );

  // bottom-left point of aabb
  const bottomLeft = Vector.create(
    aabb.position.x - aabb.width / 2,
    aabb.position.y + aabb.height / 2
  );

  // Line from top-left to bottom-left of aabb
  const aabbLeftLine = {
    start: topLeft,
    end: bottomLeft,
  };

  const leftNormal = lineNormals(aabbLeftLine)[0];

  // Line from top-left to top-right of aabb
  const aabbTopLine = {
    start: topLeft,
    end: topRight,
  };

  const topNormal = lineNormals(aabbTopLine)[0];

  // Line from top-right to bottom-right of aabb
  const aabbRightLine = {
    start: topRight,
    end: bottomRight,
  };

  const rightNormal = lineNormals(aabbRightLine)[1];

  // Line from bottom-right to bottom-left of aabb
  const aabbBottomLine = {
    start: bottomLeft,
    end: bottomRight,
  };

  const bottomNormal = lineNormals(aabbBottomLine)[1];

  const leftIntersection = lineLineIntersection(line, aabbLeftLine);
  const topIntersection = lineLineIntersection(line, aabbTopLine);
  const rightIntersection = lineLineIntersection(line, aabbRightLine);
  const bottomIntersection = lineLineIntersection(line, aabbBottomLine);

  const intersectionPoints = [
    {
      contactPoint: leftIntersection,
      normal: leftNormal,
    },
    {
      contactPoint: topIntersection,
      normal: topNormal,
    },
    {
      contactPoint: rightIntersection,
      normal: rightNormal,
    },
    {
      contactPoint: bottomIntersection,
      normal: bottomNormal,
    },
  ];

  return intersectionPoints.filter(
    (point) => point.contactPoint !== null
  ) as LineAabbIntersection[];
}

export default lineAabbIntersection;
export type { LineAabbIntersection };
