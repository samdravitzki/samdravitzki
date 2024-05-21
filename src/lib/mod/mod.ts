
/**
 * The % operator in Javascript is called the remainder operator and you can use this to create
 * a modulo operator. I was confused by this as I orignally thought that % was a modulo operation
 * as I was no aware there was a difference
 * 
 * More infomation can be found at https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
 */
export default function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
}