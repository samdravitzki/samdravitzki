import Vector from "../Vector/Vector";
import {mat3} from "gl-matrix";

// prettier-ignore
type Matrix3x3Data = [
    number, number, number,
    number, number, number,
    number, number, number,
];

// based on https://webglfundamentals.org/webgl/lessons/webgl-3d-perspective.html
export default class Matrix3x3 {
    private readonly matrix: mat3;

    get value() {
        return Array.from(this.matrix);
    }

    constructor(matrix?: Matrix3x3Data) {
        this.matrix = matrix ? mat3.fromValues(...matrix) : mat3.create();
    }

    static fromTranslation(position: Vector) {
        const translatedMatrix = mat3.create();
        mat3.translate(translatedMatrix, translatedMatrix, [position.x, position.y]);
        return new Matrix3x3(translatedMatrix as Matrix3x3Data);
    }

    static fromRotation(angle: number) {
        const rotatedMatrix = mat3.create();
        mat3.rotate(rotatedMatrix, rotatedMatrix, angle);
        return new Matrix3x3(rotatedMatrix as Matrix3x3Data);
    }

    static fromScale(scale: Vector) {
        const scaledMatrix = mat3.create();
        mat3.scale(scaledMatrix, scaledMatrix, [scale.x, scale.y]);
        return new Matrix3x3(scaledMatrix as Matrix3x3Data);
    }


    times(other: Matrix3x3) {
        const result = mat3.create();
        mat3.multiply(result, this.matrix, other.matrix);
        return new Matrix3x3(result as Matrix3x3Data);
    }
    
}