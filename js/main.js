import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import Shaders from "./shaders.js";
import Config from "./config.js";
import StarProfile from "./star-profile.js";
import PlanetProfile from "./planet-profile.js";
import { Universe, System, Star, Planet } from "./astro-bodies.js";
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
    createPlanet(seed, star) {
        return new Planet({
            "three": this.three,
            "geometry": this.geometry,
            "shader": this.cfg.shader("planet"),
            "profile": new PlanetProfile(seed, star),
            "size": 0.3,
            "position": { x: 0.6, y: -0.4, z: 0 }
        });
        //const planetSize = 0.3; // tweak visually
        /*const planetShader = this.cfg.shader("planet");
        const planetMaterial = new this.three.ShaderMaterial({
        uniforms: universe.uniforms,
        transparent: true,
        vertexShader: planetShader.vertex,
        fragmentShader: planetShader.fragment
        });

        // radius 160 → scale relative to screen
        const planetSize = 0.3; // tweak visually

        const planet = new this.three.Mesh(
            new this.three.PlaneGeometry(planetSize, planetSize),
            planetMaterial
        );

        // position near (200,200) in screen-ish space
        planet.position.set(0.6, -0.4, 0); // tweak as needed  
        return planet;  */    
    }
}

const universe = new Universe(THREE);

const factory = new AstroBodyFactory(THREE, config);

const star = factory.createStar(1); 
const planet = factory.createPlanet(1, star);
universe.addSystem(new System(star, [planet]));
scene.add(star.mesh);
scene.add(planet.mesh);

function animate(timestamp) {
    universe.update(timestamp, renderer);
    renderer.render(scene, camera);
    DeltaReport.log(timestamp);
    requestAnimationFrame(animate);
}

animate(performance.now());