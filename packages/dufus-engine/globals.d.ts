/**
 * Global declaration for importing CSS files in TypeScript.
 *
 * This wont work when this project is published as a library as css is handling the build and so wont
 * copy over the css files. When we get to this point will need to look into a solution for this. For now
 * this works as this lib is only used by projects in this repo which can handle the building of the lib
 * including copying over the css files.
 */
declare module "*.css";
