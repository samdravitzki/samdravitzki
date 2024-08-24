import Vector from '../../../Vector/Vector';
import { Aabb } from './collision-shapes';

type AabbAabbIntersection = {
    contactPoint: Vector;
    normal: Vector;
    penetration: number;
};

/**
 * From https://research.ncl.ac.uk/game/mastersdegree/gametechnologies/physicstutorials/4collisiondetection/Physics%20-%20Collision%20Detection.pdf
 * @param aabb1 
 * @param aabb2 
 * @returns intersection between two axis aligned bounding boxes
 */
function aabbAabbIntersection(aabb1: Aabb, aabb2: Aabb): AabbAabbIntersection | null {
    const deltaPosition = aabb1.position.minus(aabb2.position);
    const combinedWidth = (aabb1.width + aabb2.width) / 2;
    const combinedHeight = (aabb1.height + aabb2.height) / 2;

    if (Math.abs(deltaPosition.x) < combinedWidth && Math.abs(deltaPosition.y) < combinedHeight) {
        const sqaureFaces = [
            new Vector(0, 1), // top
            new Vector(1, 0), // right
            new Vector(0, -1), // bottom
            new Vector(-1, 0), // left
        ];

        const colliderAMaximumPoint = new Vector(
            aabb1.position.x + aabb1.width / 2,
            aabb1.position.y + aabb1.height / 2,
        );

        const colliderAMinimumPoint = new Vector(
            aabb1.position.x - aabb1.width / 2,
            aabb1.position.y - aabb1.height / 2,
        );

        const colliderBMaximumPoint = new Vector(
            aabb2.position.x + aabb2.width / 2,
            aabb2.position.y + aabb2.height / 2,
        );

        const colliderBMinimumPoint = new Vector(
            aabb2.position.x - aabb2.width / 2,
            aabb2.position.y - aabb2.height / 2,
        );

        const distances = [
            (colliderAMaximumPoint.y - colliderBMinimumPoint.y), // Distance from 'top' of 'a' to 'bottom' of 'b'
            (colliderAMaximumPoint.x - colliderBMinimumPoint.x), // Distance from 'right' of 'a' to 'left' of 'b'
            (colliderBMaximumPoint.y - colliderAMinimumPoint.y), // Distance from 'bottom' of 'a' to 'top' of 'b'
            (colliderBMaximumPoint.x - colliderAMinimumPoint.x), // Distance from 'left' of 'a' to 'right' of 'b'
        ];

        let bestAxis: Vector = new Vector(0, 0);
        let penetration: number = Infinity;

        for (let i = 0; i < 6; i++) {
            if (distances[i] < penetration) {
                penetration = distances[i];
                bestAxis = sqaureFaces[i];
            }
        }

        return {
            contactPoint: new Vector(0, 0),
            normal: bestAxis,
            penetration: penetration,
        };
    }

    return null;
}

export default aabbAabbIntersection;
export type { AabbAabbIntersection };
