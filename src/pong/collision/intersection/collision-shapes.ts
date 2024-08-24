import Vector from '../../../Vector/Vector';

export type Line = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export type Rectangle = {
    x: number;
    y: number;
    height: number;
    width: number;
}

/**
 * Axis aligned bounding box
 */
export type Aabb = {
    position: Vector;
    width: number;
    height: number;
}
