import World from '../ecs/World/World';
import Vector from '../Vector/Vector';
import { Position, Collider, Collision } from './components';

type Line = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

type Rectangle = {
    x: number;
    y: number;
    height: number;
    width: number;
}

/**
 * Given a line return the two normal vectors perpendicular to that line
 * @param line 
 */
function lineNormals(line: Line): [Vector, Vector] {
    const dx = line.x2 - line.x1;
    const dy = line.y2 - line.y1;

    const normal1 = Vector.create(-dy, dx);
    const normal2 = Vector.create(dy, -dx);

    return [normal1.normalised(), normal2.normalised()];
}

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

    if (uA > 0 && uA < 1 && uB > 0 && uB < 1) {
        const intersectionX = x1 + (uA * (x2-x1));
        const intersectionY = y1 + (uA * (y2-y1));

        return Vector.create(intersectionX, intersectionY);
    }

    return null;

}

type Intersection = { position: Vector, normal: Vector };

/**
 * Given a line and a rectangle return the points of intersection between the line and rectangle
 * if they are touching. If they are not touching no points of intersection are returned
 * 
 * Math from https://www.jeffreythompson.org/collision-detection/line-rect.php where the main difference
 * is here we assume a center positioned rectangle
 * @param line 
 * @param rectangle 
 */
function lineRectangleIntersection(line: Line, rectangle: Rectangle): Intersection[] {
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

    const bottomNormal = lineNormals(rectangleRightLine)[1]

    const leftIntersection = lineLineIntersection(line, rectangleLeftLine);
    const topIntersection = lineLineIntersection(line, rectangleTopLine);
    const rightIntersection = lineLineIntersection(line, rectangleRightLine);
    const bottomIntersection = lineLineIntersection(line, rectangleBottomLine);

    const intersectionPoints = [
        {
            position: leftIntersection,
            normal: leftNormal,
        },
        {
            position: topIntersection,
            normal: topNormal,
        },
        {
            position: rightIntersection,
            normal: rightNormal,
        },
        {
            position: bottomIntersection,
            normal: bottomNormal,
        },
    ];

    return intersectionPoints.filter((point) => point.position !== null) as Intersection[];
}

type Ray = {
    position: Vector,
    direction: Vector,
    length: number, // Prob should have infinitly long rays by default, not sure how to do this tho
}

type Hit = {
    position: Vector;
    normal: Vector;
}

export function castRay(world: World, ray: Ray): Hit[] {
    const colliders = world.query(['position', 'collider']) as [Position, Collider][];

    const hits: Hit[] = [];

    for (const [position, collider] of colliders.filter(([,c]) => c.layer === 'wall')) {
        if (collider.type === 'aabb') {

            const line: Line = {
                x1: ray.position.x,
                y1: ray.position.y,
                x2: ray.position.x + (ray.direction.x * ray.length), 
                y2: ray.position.y + (ray.direction.y * ray.length), 
            }

            const rectangle: Rectangle = {
                x: position.position.x,
                y: position.position.y,
                width: collider.width,
                height: collider.height,
            }

            const intersections = lineRectangleIntersection(line, rectangle);

            // Sort is a mutating method so it cannot be chained
            intersections.sort((intersectionA, intersectionB) => (
                intersectionA.position.distance(ray.position) - intersectionB.position.distance(ray.position) 
            ));

            const closestIntersection = intersections[0];

            if (closestIntersection) {
                hits.push({
                    position: closestIntersection.position,
                    normal: closestIntersection.normal,
                });
            }
        }
    }

    return hits;

}

function collisionSystem(world: World) {
    const colliders = world.query(['position', 'collider']) as [Position, Collider][];

    for (const [positionA, colliderA] of colliders) {
        for (const [positionB, colliderB] of colliders) {

            if (positionA.entityId === positionB.entityId) {
                // Exclude collisions with itself
                continue;
            }

            if (colliderA.type === 'aabb' && colliderB.type === 'aabb') {
                // From https://research.ncl.ac.uk/game/mastersdegree/gametechnologies/physicstutorials/4collisiondetection/Physics%20-%20Collision%20Detection.pdf
                const deltaPosition = positionA.position.minus(positionB.position);
                const combinedWidth = (colliderA.width + colliderB.width) / 2;
                const combinedHeight = (colliderA.height + colliderB.height) / 2;

                if (Math.abs(deltaPosition.x) < combinedWidth && Math.abs(deltaPosition.y) < combinedHeight) {
                    const sqaureFaces = [
                        new Vector(0, 1), // top
                        new Vector(1, 0), // right
                        new Vector(0, -1), // bottom
                        new Vector(-1, 0), // left
                    ];

                    const colliderAMaximumPoint = new Vector(
                        positionA.position.x + colliderA.width / 2,
                        positionA.position.y + colliderA.height / 2,
                    );

                    const colliderAMinimumPoint = new Vector(
                        positionA.position.x - colliderA.width / 2,
                        positionA.position.y - colliderA.height / 2,
                    );

                    const colliderBMaximumPoint = new Vector(
                        positionB.position.x + colliderB.width / 2,
                        positionB.position.y + colliderB.height / 2,
                    );

                    const colliderBMinimumPoint = new Vector(
                        positionB.position.x - colliderB.width / 2,
                        positionB.position.y - colliderB.height / 2,
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

                    const collision: Collision = {
                        entityId: colliderA.entityId,
                        name: 'collision',
                        contactPoint: new Vector(0, 0), // Contact point on a AABB is just its local origin
                        normal: bestAxis,
                        penetration: penetration,
                    }

                    world.replaceComponent(collision)
                }
            }
        }
    }
}

function collisionLoggingSystem(world: World) {
    for (const [collision] of world.query(['collision']) as [Collision][]) {
        console.log(JSON.stringify(collision))
    }
}

/**
 * Remove all the collisions that exist in the world
 * 
 * Designed to be used to cleanup the collisions at the end of tick so that collisions
 * are not left over after they have completed
 * @param world 
 */
function collisionCleanupSystem(world: World) {
    for (const [collision] of world.query(['collision']) as [Collision][]) {
        world.removeComponent(collision);
    }
}

export {
    collisionCleanupSystem,
    collisionLoggingSystem,
    collisionSystem,
}
