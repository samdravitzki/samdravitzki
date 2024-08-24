import Vector from '../../../Vector/Vector';
import { Line, Aabb } from './intersection-shapes';
import lineLineIntersection from './line-line-intersection';

/**
 * Given a line return the two normal vectors perpendicular to that line
 * @param line 
 */
function lineNormals(line: Line): [Vector, Vector] {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;

    const normal1 = Vector.create(dy === 0 ? 0 : -dy, dx);
    const normal2 = Vector.create(dy, dx === 0 ? 0 : -dx);

    return [normal1.normalised(), normal2.normalised()];
}

type LineAabbIntersection = { contactPoint: Vector, normal: Vector };

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
    const topLeft = {
        x: aabb.position.x - aabb.width / 2,
        y: aabb.position.y - aabb.height / 2,
    };

    // top-right point of aabb
    const topRight = {
        x: aabb.position.x + aabb.width / 2,
        y: aabb.position.y - aabb.height / 2,
    };

    // bottom-right point of aabb
    const bottomRight = {
        x: aabb.position.x + aabb.width / 2,
        y: aabb.position.y + aabb.height / 2,
    };

    // bottom-left point of aabb
    const bottomLeft = {
        x: aabb.position.x - aabb.width / 2,
        y: aabb.position.y + aabb.height / 2,
    };

    // Line from top-left to bottom-left of aabb
    const aabbLeftLine = {
        x1: topLeft.x,
        y1: topLeft.y,
        x2: bottomLeft.x,
        y2: bottomLeft.y,
    }

    const leftNormal = lineNormals(aabbLeftLine)[0]

    // Line from top-left to top-right of aabb
    const aabbTopLine = {
        x1: topLeft.x,
        y1: topLeft.y,
        x2: topRight.x,
        y2: topRight.y,
    }

    const topNormal = lineNormals(aabbTopLine)[0]

    // Line from top-right to bottom-right of aabb
    const aabbRightLine = {
        x1: topRight.x,
        y1: topRight.y,
        x2: bottomRight.x,
        y2: bottomRight.y,
    }

    const rightNormal = lineNormals(aabbRightLine)[1]

    // Line from bottom-right to bottom-left of aabb
    const aabbBottomLine = {
        x1: bottomLeft.x,
        y1: bottomLeft.y,
        x2: bottomRight.x,
        y2: bottomRight.y,
    }

    const bottomNormal = lineNormals(aabbBottomLine)[1]

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

    return intersectionPoints.filter((point) => point.contactPoint !== null) as LineAabbIntersection[];
}

export default lineAabbIntersection;
export type { LineAabbIntersection };