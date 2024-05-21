export default function randomInt(max: number, interval: number): number {
    return Math.ceil(Math.floor(Math.random() * max) / interval) * interval;
}