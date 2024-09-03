import Component from '../Component/Component';

/**
 * Used to make the process of adding components and entities into the world easier allowing
 * you to bundle common components together and associate them with an entity. When a bundle
 * is used with the `createBundle` factory the process becomes even easier
 * 
 * Based on the same concept that exists in bevy https://bevy-cheatbook.github.io/programming/bundle.html
 */
type Bundle = {
    components: Component[],
}

export default Bundle;