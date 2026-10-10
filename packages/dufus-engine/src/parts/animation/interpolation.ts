import { Vector } from "../../core";

export type InterpolationFunction<T> = (from: T, to: T, t: number) => T;

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function lerpNumberArray(from: number[], to: number[], t: number) {
  return from.map((f, i) => lerp(f, to[i], t));
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((v) => typeof v === "number");
}

function isVectorArray(value: unknown): value is Vector[] {
  return Array.isArray(value) && value.every((v) => v instanceof Vector);
}

function lerpVectorArray(from: Vector[], to: Vector[], t: number) {
  return from.map((f, i) => Vector.lerp(f, to[i], t));
}

export function selectInterpolationFunction(
  from: unknown,
  to: unknown,
): InterpolationFunction<any> | undefined {
  if (typeof from === "number" && typeof to === "number") {
    return lerp;
  }

  if (from instanceof Vector && to instanceof Vector) {
    return Vector.lerp;
  }

  if (isNumberArray(from) && isNumberArray(to)) {
    return lerpNumberArray;
  }

  if (isVectorArray(from) && isVectorArray(to)) {
    return lerpVectorArray;
  }
}
