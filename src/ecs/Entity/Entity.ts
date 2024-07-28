export default class Entity {
    readonly id: string;
    constructor() {
        this.id = window.crypto.randomUUID();
    }
}