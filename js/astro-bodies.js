import StarUniforms from "./star-uniforms.js";
import PlanetUniforms from "./planet-uniforms.js";

class AstroBody {
    constructor() {
        this.uniforms = {};
    }
    setGlobals(globals) { 
        this.globalUniforms = globals;
        this.uniforms.time = globals.time;
        this.uniforms.resolution = globals.resolution;
    }
    update(timestamp, renderer) {

    }
}

export class Universe extends AstroBody {
    constructor(three) {
        super();
        this.systems = [];
        this.stars = [];
        this.uniforms = {
            time: { value: 0 },
            resolution: { value: new three.Vector2() }
        };
    } 
    update(timestamp, renderer) {
        this.uniforms.time.value = timestamp * 0.001;
        this.uniforms.resolution.value.set(
            renderer.domElement.width,
            renderer.domElement.height
        );
        for ( const sys of this.systems )
            sys.update(timestamp, renderer);
    }
    addSystem(sys) {
        sys.setGlobals(this.uniforms);
        this.systems.push(sys);
    }
    addStar(s) {
        s.setGlobals(this.uniforms);
        this.star = s;
    }
}

export class System extends AstroBody {
    constructor(s, ps, scene) {
        super();
        this.star = s;
        scene.add(this.star.mesh);
        this.planets = [];
        for ( const p of ps ) {
            scene.add(p.mesh);
            this.addPlanet(p);
        }
    }
    setGlobals(globals) { 
        /*this.globalUniforms = globals;
        this.uniforms.time = globals.time;
        this.uniforms.resolution = globals.resolution;*/

        this.star.setGlobals(globals);

        for ( const p of this.planets ) {
            p.setGlobals(globals);
        }
    }
    update(timestamp, renderer) {
        this.star.update(timestamp, renderer);
        for ( const p of this.planets )
            p.update(timestamp, renderer);
    }
    addPlanet(p) {
        this.planets.push(p);
    }
}

export class Planet extends AstroBody {
    constructor(cfg) {
        super();
        this.profile = cfg.profile;
        const puniforms = new PlanetUniforms(cfg.three);
        this.uniforms = puniforms.apply(this.profile).data();

        const material = new cfg.three.ShaderMaterial({
            uniforms: this.uniforms,
            transparent: true,
            vertexShader: cfg.shader.vertex,
            fragmentShader: cfg.shader.fragment 
        });

        this.mesh = new cfg.three.Mesh(
            new cfg.three.PlaneGeometry(this.profile.getSize(), this.profile.getSize()),
            material
        );
const starPos = this.profile.getStarPos();
const orbit = this.profile.getOrbit();

this.mesh.position.set(
    starPos.x + Math.cos(orbit.angle) * orbit.radius,
    starPos.y + Math.sin(orbit.angle) * orbit.radius,
    starPos.z
);
        //this.mesh.position.set(cfg.position.x, cfg.position.y, cfg.position.z); // tweak as needed  
    }
}

export class Star extends AstroBody {
    constructor(cfg) {
        super();
        this.profile = cfg.profile;
        const suniforms = new StarUniforms(cfg.three);
        this.uniforms = suniforms.apply(this.profile).data();

        const material = new cfg.three.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: cfg.shader.vertex,
            fragmentShader: cfg.shader.fragment 
        });
        //this.mesh = new cfg.three.Mesh(cfg.geometry, material);
        this.mesh = new cfg.three.Mesh(
            new cfg.three.PlaneGeometry(1.4, 1.4),
            material
        );
        this.mesh.position.set(0.41, 0.1, 0);
    }
    getType() {
        return this.profile.type;
    }
}