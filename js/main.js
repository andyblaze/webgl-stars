import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import Shaders from "./shaders.js";
import Config from "./config.js";
import StarProfile from "./star-profile.js";
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
    }

    addSystem(sys) {
        sys.setGlobals(this.uniforms);
        this.systems.push(sys);
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

class Star {
    constructor() {

    }
    setGlobals(globals) {
        this.globalUniforms = globals;
    }
}

class Planet {
    constructor() {

    }
    setGlobals(globals) {
        this.globalUniforms = globals;
    }
}

class StarUniforms {
  constructor(three) {
    this.three = three;
    this._data = {
      time: { value: 0 },
      resolution: { value: new three.Vector2() },

      flowDir: { value: new three.Vector2() },
      flowSpeed: { value: 0 },

      colorA: { value: new three.Vector3() },
      colorB: { value: new three.Vector3() },

      brightness: { value: 1 }
    }
  }
setData(key, val) {
  const u = this._data[key];
  if (!u) return;

  const target = u.value;

  // numbers (float uniforms)
  if (typeof target === "number") {
    u.value = val;
    return;
  }

  // arrays → [x,y] or [x,y,z]
  if (Array.isArray(val)) {
    target.set(...val);
    return;
  }

  // objects → {x,y} or {x,y,z}
  if (val && typeof val === "object") {
    target.set(
      val.x ?? 0,
      val.y ?? 0,
      val.z ?? 0
    );
    return;
  }

  // fallback
  u.value = val;
}
apply(profile) {
const data = profile.toUniforms();

for ( const key in data ) {
  this.setData(key, data[key]);
}
}
  data() {
    return this._data;
  }
}

class AstroBodyFactory {
    constructor(three) {
        this.three = three;
    }
    create(uniforms, shader) {
        const starMaterial = new this.three.ShaderMaterial({
            uniforms,
            vertexShader: shader.vertex,
            fragmentShader: shader.fragment 
        });
        return new this.three.Mesh(new this.three.PlaneGeometry(2, 2), starMaterial);
    }
}

const factory = new AstroBodyFactory(THREE);

const starUniforms = new StarUniforms(THREE);

const starProfile = new StarProfile(1); // 10 is placeholder
starUniforms.apply(starProfile);

const uniforms = starUniforms.data();

const star = factory.create(uniforms, config.shader("star")); 
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
  DeltaReport.log(timestamp);
  requestAnimationFrame(animate);
}

animate(performance.now());