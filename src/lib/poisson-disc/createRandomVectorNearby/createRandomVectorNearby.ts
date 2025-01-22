import Vector from "../../../ecs/core/Vector/Vector";

/**
 * Generate a dot within a radius of a supplied dot
 */
function createRandomVectorNearby(
  point: Vector,
  radius: number,
  minRadius: number = 0
) {
  const randomAngle = 2 * Math.PI * Math.random();
  const randomRadius = (radius - minRadius) * Math.random() + minRadius;

  const x = point.x + randomRadius * Math.cos(randomAngle);
  const y = point.y + randomRadius * Math.sin(randomAngle);

  return Vector.create(x, y);
}

export default createRandomVectorNearby;
