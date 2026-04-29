import { shaders } from "./shaders.js";

export default class Config {
    constructor() {
        this.shaders = shaders;
    }
    vertexShader(type) {
        return this.shaders[type].vertex;
    }
    fragmentShader(type) {
        return this.shaders[type].fragment;
    }
    shader(type) {
        return this.shaders[type];
    }
}
