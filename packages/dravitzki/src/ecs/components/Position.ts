import Vector from "../core/Vector/Vector";
import { component } from "../core/Component/Component";

// Issue: The structure of this component results in position.position to get its position, which is pretty awkward.
//       - Could resolve this by allowing the component to take any type where the position component would be defined like so...
//         const position = component<Vector>({ name: "position" });

type PositionData = {
  position: Vector;
};

// Issue: The name of the component and component definition are the same, which results in clashes when querying for components
// which requires using the component definition. Could resolve this by still keeping the name concise by grouping the defintions
// user a namespace. Resulting in something like...
// const [position] = world.query([dufus.position])
const Position = component<PositionData>({ name: "position" });

export default Position;
export type { PositionData };
