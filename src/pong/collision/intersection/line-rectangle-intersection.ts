import Vector from '../../../Vector/Vector';
import { Line, Rectangle } from './collision-shapes';
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

type LineRectangleIntersection = { contactPoint: Vector, normal: Vector };

/**
 * Given a line and a rectangle return the points of intersection between the line and rectangle
 * if they are touching. If they are not touching no points of intersection are returned
 * 
 * Math from https://www.jeffreythompson.org/collision-detection/line-rect.php where the main difference
 * is here we assume a center positioned rectangle
 * @param line 
 * @param rectangle 
 */
function lineRectangleIntersection(line: Line, rectangle: Rectangle): LineRectangleIntersection[] {
    // top-left point of rectangle
    const topLeft = {
        x: rectangle.x - rectangle.width / 2,
        y: rectangle.y - rectangle.height / 2,
    };

    // top-right point of rectangle
    const topRight = {
        x: rectangle.x + rectangle.width / 2,
        y: rectangle.y - rectangle.height / 2,
    };

    // bottom-right point of rectangle
    const bottomRight = {
        x: rectangle.x + rectangle.width / 2,
        y: rectangle.y + rectangle.height / 2,
    };

    // bottom-left point of rectangle
    const bottomLeft = {
        x: rectangle.x - rectangle.width / 2,
        y: rectangle.y + rectangle.height / 2,
    };

    // Line from top-left to bottom-left of rectangle
    const rectangleLeftLine = {
        x1: topLeft.x,
        y1: topLeft.y,
        x2: bottomLeft.x,
        y2: bottomLeft.y,
    }

    const leftNormal = lineNormals(rectangleLeftLine)[0]

    // Line from top-left to top-right of rectangle
    const rectangleTopLine = {
        x1: topLeft.x,
        y1: topLeft.y,
        x2: topRight.x,
        y2: topRight.y,
    }

    const topNormal = lineNormals(rectangleTopLine)[0]

    // Line from top-right to bottom-right of rectangle
    const rectangleRightLine = {
        x1: topRight.x,
        y1: topRight.y,
        x2: bottomRight.x,
        y2: bottomRight.y,
    }

    const rightNormal = lineNormals(rectangleRightLine)[1]

    // Line from bottom-right to bottom-left of rectangle
    const rectangleBottomLine = {
        x1: bottomLeft.x,
        y1: bottomLeft.y,
        x2: bottomRight.x,
        y2: bottomRight.y,
    }

    const bottomNormal = lineNormals(rectangleBottomLine)[1]

    const leftIntersection = lineLineIntersection(line, rectangleLeftLine);
    const topIntersection = lineLineIntersection(line, rectangleTopLine);
    const rightIntersection = lineLineIntersection(line, rectangleRightLine);
    const bottomIntersection = lineLineIntersection(line, rectangleBottomLine);

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

    return intersectionPoints.filter((point) => point.contactPoint !== null) as LineRectangleIntersection[];
}

export default lineRectangleIntersection;
export type { LineRectangleIntersection };