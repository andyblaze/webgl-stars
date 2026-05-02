import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import Shaders from "./shaders.js";
import Config from "./config.js";
import StarProfile from "./star-profile.js";
import StarUniforms from "./star-uniforms.js";
import DeltaReport from "./delta-report.js";

const config = new Config(new Shaders()); 

const scene = new THREE.Scene();
const camera = new THREE.Camera();
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: false });
document.body.appendChild(renderer.domElement);

const scale = 0.6;

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w * scale, h * scale, false);
  renderer.domElement.style.width = w + "px";
  renderer.domElement.style.height = h + "px";
}
window.addEventListener("resize", resize);
resize();

class Universe {
    constructor(three) {
        this.systems = [];
        this.star = {};
        this.uniforms = {
            time: { value: 0 },
            resolution: { value: new three.Vector2() }
        };
    } 
    update(timestamp, renderer) {
        /*this.uniforms.time.value = timestamp * 0.001;
        this.uniforms.resolution.value.set(
            renderer.domElement.width,
            renderer.domElement.height
        );*/
        this.star.update(timestamp, renderer);
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

class System {
    constructor(s) {
        this.star = s;
        this.planets = [];
    }
    setGlobals(globals) {
        this.globalUniforms = globals;

        this.star.setGlobals(globals);

        for ( const p of this.planets ) {
            p.setGlobals(globals);
        }
    }
    update() {

    }
    addPlanet(p) {
        p.setGlobals(this.globalUniforms);
        this.planets.push(p);
    }
}

class Planet {
    constructor() {

    }
    setGlobals(globals) {
        this.globalUniforms = globals;
    }
}

class Star {
    constructor(cfg) {
        this.profile = cfg.profile;
        const suniforms = new StarUniforms(cfg.three);
        this.uniforms = suniforms.apply(this.profile).data();

        const material = new cfg.three.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: cfg.shader.vertex,
            fragmentShader: cfg.shader.fragment 
        });
        this.mesh = new cfg.three.Mesh(cfg.geometry, material);
    }
    setGlobals(globals) {
        this.globalUniforms = globals;
        this.uniforms.time = globals.time;
        this.uniforms.resolution = globals.resolution;
    }

    update(timestamp, renderer) {
        this.uniforms.time.value = timestamp;
        this.uniforms.resolution.value.set(
            renderer.domElement.width,
            renderer.domElement.height
        );
    }
}


class AstroBodyFactory {
    constructor(three, cfg) {
        this.three = three;
        this.cfg = cfg;
        this.geometry = new this.three.PlaneGeometry(2, 2);
    }
    createStar(seed) {
        return new Star({
            "three": this.three,
            "geometry": this.geometry,
            "shader": this.cfg.shader("star"),
            "profile": new StarProfile(seed)
        });
    }
}

const universe = new Universe(THREE);

const factory = new AstroBodyFactory(THREE, config);

const star = factory.createStar(1); 
universe.addStar(star);
scene.add(star.mesh);

//
// 🌍 PLANET (simple starter shader)
//
/*const planetShader = config.shader("planet");
const planetMaterial = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  vertexShader: planetShader.vertex,
  fragmentShader: planetShader.fragment
});

// radius 160 → scale relative to screen
const planetSize = 0.3; // tweak visually

const planet = new THREE.Mesh(
  new THREE.PlaneGeometry(planetSize, planetSize),
  planetMaterial
);

// position near (200,200) in screen-ish space
planet.position.set(0.6, -0.4, 0); // tweak as needed
scene.add(planet);*/

//
// 🎬 LOOP
//
function animate(timestamp) {
    universe.update(timestamp * 0.001, renderer);
  /*star.uniforms.time.value = timestamp * 0.001;
  star.uniforms.resolution.value.set(
    renderer.domElement.width,
    renderer.domElement.height
  );*/

  renderer.render(scene, camera);
  DeltaReport.log(timestamp);
  requestAnimationFrame(animate);
}

animate(performance.now());