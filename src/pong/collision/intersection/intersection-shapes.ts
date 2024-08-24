import Vector from '../../../Vector/Vector';

export type Line = {
    start: Vector;
    end: Vector;
}

/**
 * Axis aligned bounding box
 */
export type Aabb = {
    position: Vector;
    width: number;
    height: number;
}
