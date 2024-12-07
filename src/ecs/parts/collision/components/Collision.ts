import Vector from "../../../../Vector/Vector";
import Component from "../../../core/Component/Component";

export type Collision = Component & {
  name: "collision";
  // The collision point of the entity in local space
  contactPoint: Vector;
  // The normal of the point collided with
  normal: Vector;
  // The depth in which the collision occured
  penetration: number;
  // The id of the entity colided with
  entityId: string;
};
