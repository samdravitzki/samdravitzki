import { Vector } from "../../core";

export type InterpolationFunction<T> = (from: T, to: T, t: number) => T;

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
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
}
