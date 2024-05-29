import { expect, test } from 'vitest';
import range from './range';

test('should return array with length equal to supplied length', () => {
    const length = 3;

    const result = range(length);

    expect(result.length).toEqual(length);
});

test('should return array where each element is a number incrementing from zero', () => {
    const length = 3;

    const result = range(length);

    expect(result).toEqual([0, 1, 2]);
});