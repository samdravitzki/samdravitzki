export default function randomInt(max: number, interval: number) {
    return Math.ceil(Math.floor(Math.random() * max) / interval) * interval;
}