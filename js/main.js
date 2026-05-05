import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import Shaders from "./shaders.js";
import Config from "./config.js";
import AstroBodyFactory from "./astro-factory.js";
import { Universe, System } from "./astro-bodies.js";
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


const universe = new Universe(THREE);

const factory = new AstroBodyFactory(THREE, config);

const star = factory.createStar(1); 
const planet1 = factory.createPlanet(1, star);
const planet2 = factory.createPlanet(2, star);
universe.addSystem(new System(star, [planet1, planet2], scene));

let lastTime = 0;
function animate(timestamp) {
    const delta = timestamp - lastTime;
    const dt = delta / 1000;
    lastTime = timestamp;
    universe.update(dt, timestamp, renderer);
    renderer.render(scene, camera);
    DeltaReport.log(timestamp);
    requestAnimationFrame(animate);
}

animate(performance.now());