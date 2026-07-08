import { expect, test } from "vitest";
import createBundle from "./createBundle";

test("should return a bundle containing no components when no components are supplied", () => {
  const result = createBundle([]);

  expect(result.components).toEqual([]);
});

test("should return bundle containing component object when component info object is supplied", () => {
  const componentInfo = { name: "component-a", componentData: 12 };

  const result = createBundle([componentInfo]);

  expect(result.components.length).toEqual(1);
  expect(result.components[0].name).toEqual(componentInfo.name);
  expect(result.components[0]).toHaveProperty("componentData");
});
