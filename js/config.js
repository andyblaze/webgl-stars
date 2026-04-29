export default class Config {
    constructor(shaders) {
        this.shaders = shaders.code;
        //for ( const [key, val] of Object.entries(shaders) )
            ///this.shaders[key] = val;
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
