import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import Config from "./config.js";

const config = new Config();

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
  resolution: { value: new THREE.Vector2() }
};

//
// ⭐ STAR (same as before)
//
const starMaterial = new THREE.ShaderMaterial({
  uniforms,
  config.vertexShader(),
  config.fragmentShader() 
});

const star = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), starMaterial);
scene.add(star);

//
// 🌍 PLANET (simple starter shader)
//
const planetMaterial = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;

    varying vec2 vUv;
    uniform vec2 resolution;

    // --- basic smooth noise ---
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(a, b, u.x) +
             (c - a)*u.y*(1.0 - u.x) +
             (d - b)*u.x*u.y;
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // --- aspect-corrected coords ---
      vec2 uv = vUv * 2.0 - 1.0;
      
      uv.x *= resolution.x / resolution.y;

      float r = length(uv);
      if (r > 1.0) discard;

      // --- fake sphere normal ---
      vec3 normal = normalize(vec3(uv, sqrt(1.0 - r*r)));

      // --- light direction ---
      vec3 lightDir = normalize(vec3(-0.6, 0.4, 1.0));

      float diffuse = dot(normal, lightDir);
      diffuse = clamp(diffuse, 0.0, 1.0);

      // --- surface (CONTINENTS, not static) ---
      float continents = fbm(uv * 2.0);

      float detail = fbm(uv * 6.0) * 0.3;

      float landMask = smoothstep(0.45, 0.55, continents + detail);

      vec3 ocean = vec3(0.05, 0.15, 0.35);
      vec3 land  = vec3(0.2, 0.5, 0.25);

      vec3 baseColor = mix(ocean, land, landMask);

      // --- lighting (stronger contrast) ---
      vec3 col = baseColor * (diffuse * 0.9 + 0.1);

      // night side fade
      col *= smoothstep(-0.2, 0.3, diffuse);

      // --- atmosphere rim ---
      float rim = pow(1.0 - r, 3.0);
      col += vec3(0.3, 0.5, 1.0) * rim * 0.4;

      gl_FragColor = vec4(col, 1.0);
    }
  `
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
function animate(t) {
  uniforms.time.value = t * 0.001;
  uniforms.resolution.value.set(
    renderer.domElement.width,
    renderer.domElement.height
  );

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();