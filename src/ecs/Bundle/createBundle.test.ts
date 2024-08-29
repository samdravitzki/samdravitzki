import { expect, test } from 'vitest';
import createBundle from './createBundle';

test('should return a bundle containing no components when no components are supplied', () => {
    const result = createBundle([]);

    expect(result.components).toEqual([]);
});

test('should return a bundle with a name when only a component name is supplied', () => {
    const componentName = 'component-a';

    const result = createBundle([componentName]);

    expect(result.components.length).toEqual(1);
    expect(result.components[0].name).toEqual(componentName)
});

test('should return bundle containing component object when component info object is supplied', () => {
    const componentInfo = { name: 'component-a', value: 12 };

    const result = createBundle([componentInfo]);

    expect(result.components.length).toEqual(1);
    expect(result.components[0].name).toEqual(componentInfo.name);
    expect(result.components[0]).toHaveProperty('value');
});