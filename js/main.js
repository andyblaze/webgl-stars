import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import Shaders from "./shaders.js";
import Config from "./config.js";
import StarProfile from "./star-prifile.js";

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

const uniforms = {
  time: { value: 0 },
  resolution: { value: new THREE.Vector2() },

  flowDir: { value: new THREE.Vector2() },
  flowSpeed: { value: 0 },

  colorA: { value: new THREE.Vector3() },
  colorB: { value: new THREE.Vector3() },

  brightness: { value: 1 }
};

const profile = new StarProfile(1021); // 10 is placeholder
uniforms.flowDir.value = new THREE.Vector2(
  profile.motion.flowDir.x,
  profile.motion.flowDir.y
);
uniforms.flowSpeed.value = profile.motion.flowSpeed;
uniforms.colorA.value = new THREE.Vector3(...profile.color.colorA);
uniforms.colorB.value = new THREE.Vector3(...profile.color.colorB);
uniforms.brightness.value = profile.energy.brightness;

const starShader = config.shader("star");
const starMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: starShader.vertex,
  fragmentShader: starShader.fragment 
});

//
// ⭐ STAR (same as before)
//
const star = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), starMaterial);
scene.add(star);

//
// 🌍 PLANET (simple starter shader)
//
const planetShader = config.shader("planet");
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
scene.add(planet);

//
// 🎬 LOOP
//
function animate(timestamp) {
  uniforms.time.value = timestamp * 0.001;
  uniforms.resolution.value.set(
    renderer.domElement.width,
    renderer.domElement.height
  );

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate(performance.now());