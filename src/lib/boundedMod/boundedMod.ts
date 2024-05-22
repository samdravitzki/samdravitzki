
/**
 * Restricts a value x to fall within a specific range, wrapping around when it exceeds the bounds
 * @param x the number to subject to the bounded mod
 * @param max the maximum number x should fall within (exclusive)
 * @param min the minimum number x should fall within (inclusive)
 * 
 * (Taken from chat gpt which said bounded_mod(x, a, b) = ((x − a) % (b − a) + (b − a)) % (b−a) + a
 */
export default function boundedMod(x: number, max: number, min: number = 0): number {
    return ((x - min) % (max - min) + (max - min)) % (max - min) + min;
}