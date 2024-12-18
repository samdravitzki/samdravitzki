import Vector from "../../ecs/core/Vector/Vector";
import Bounds from "../../ecs/core/Bounds/Bounds";
import randomInt from "../../lib/randomInt/randomInt";

/**
 * Generate a bunch of random positions within a given bounds
 *
 * This is useful to demo the difference in pattern between random positioning
 * and poisson disc positions
 *
 * @param count the number of dots to generate
 * @param bounds the bounds to genereate the dots within
 */
function randomDots(count: number, bounds: Bounds) {
  return [...Array(count).keys()].map((dot) =>
    Vector.create(
      randomInt(bounds.max.x - bounds.min.x),
      randomInt(bounds.max.y - bounds.min.y)
    )
  );
}

export default randomDots;
