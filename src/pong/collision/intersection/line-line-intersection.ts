import Vector from '../../../Vector/Vector';
import { Line } from './collision-shapes';


/**
 * Given two lines return the point of intersection between those two lines
 * if they are touching otherwise return null
 * 
 * Math from https://www.jeffreythompson.org/collision-detection/line-line.php
 * @param line1 
 * @param line2 
 */
function lineLineIntersection(line1: Line, line2: Line): Vector | null {
    const x1 = line1.x1;
    const x2 = line1.x2;
    const x3 = line2.x1;
    const x4 = line2.x2;
    const y1 = line1.y1;
    const y2 = line1.y2;
    const y3 = line2.y1;
    const y4 = line2.y2;

    const uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    const uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

    const epsilon = 0.01;

    if (uA >= 0 + epsilon && uA <= 1 - epsilon && uB >= 0 + epsilon && uB <= 1 - epsilon) {
        const intersectionX = x1 + (uA * (x2-x1));
        const intersectionY = y1 + (uA * (y2-y1));

        return Vector.create(intersectionX, intersectionY);
    }

    return null;

}

export default lineLineIntersection;
