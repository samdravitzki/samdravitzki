import Vector from "../core/Vector/Vector";
import { component } from "../core/Component/Component";

// Issue: The structure of this component results in position.position to get its position, which is pretty awkward.
//       - Could resolve this by allowing the component to take any type where the position component would be defined like so...
//         const position = component<Vector>({ name: "position" });

type PositionData = {
  position: Vector;
};

const Position = component<PositionData>({ name: "position" });

export default Position;
export type { PositionData };
