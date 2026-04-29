export default class Config {
    constructor(shaders) {
        this.shaders = shaders.code;
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
