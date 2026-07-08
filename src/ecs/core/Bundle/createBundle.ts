import Component from "../Component/Component";
import Bundle from "./Bundle";

/**
 * Component data used to create each component associated with an enitity
 */

export default function createBundle(componentInfo: Component[]): Bundle {
  const components = componentInfo.map<Component>((info) => {
    return info;
  });

  return { components };
}
