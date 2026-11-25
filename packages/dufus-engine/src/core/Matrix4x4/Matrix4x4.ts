import Vector from "../Vector/Vector";
import {mat4} from "gl-matrix";

// prettier-ignore
type Matrix4x4Data = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

// based on https://webglfundamentals.org/webgl/lessons/webgl-3d-perspective.html
export default class Matrix4x4 {
    private readonly matrix: mat4;

    get value() {
        return Array.from(this.matrix);
    }

    constructor(matrix?: Matrix4x4Data) {
        this.matrix = matrix ? mat4.fromValues(...matrix) : mat4.create();
    }

    static fromTranslation(position: Vector) {
        const translatedMatrix = mat4.create();
        mat4.translate(translatedMatrix, translatedMatrix, [position.x, position.y, 0]);
        return new Matrix4x4(translatedMatrix as Matrix4x4Data);
    }

    static fromRotation(angle: number) {
        const rotatedMatrix = mat4.create();
        mat4.rotateZ(rotatedMatrix, rotatedMatrix, angle);
        return new Matrix4x4(rotatedMatrix as Matrix4x4Data);
    }

    static fromScale(scale: Vector) {
        const scaledMatrix = mat4.create();
        mat4.scale(scaledMatrix, scaledMatrix, [scale.x, scale.y, 1]);
        return new Matrix4x4(scaledMatrix as Matrix4x4Data);
    }


    times(other: Matrix4x4) {
        const result = mat4.create();
        mat4.multiply(result, this.matrix, other.matrix);
        return new Matrix4x4(result as Matrix4x4Data);
    }
    
}