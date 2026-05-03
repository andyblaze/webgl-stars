import AstroBodyProfile from "./astrobody-profile.js";

export default class StarProfile extends AstroBodyProfile {
  constructor(seed) {
    super(seed);

    this.motion = this.generateMotion();
    this.color = this.generateColor();
    this.energy = this.generateEnergy();
    this.type = "";
  }
toUniforms() {
  return {
    flowDir: this.motion.flowDir,
    flowSpeed: this.motion.flowSpeed,
    colorA: this.color.colorA,
    colorB: this.color.colorB,
    brightness: this.energy.brightness
  };
}


  // -------------------------
  // 🌪 Motion
  // -------------------------
  generateMotion() {
    const r = this._rng;

    const angle = r() * Math.PI * 2.0;
    const flowDir = [
       Math.cos(angle),
       Math.sin(angle)
    ];

    return {
      flowDir,
      flowSpeed: 0.1 + r() * 0.3,
      warpStrength: 0.2 + r() * 0.3
    };
  }

  // -------------------------
  // 🎨 Color
  // -------------------------
  generateColor() {
    const r = this._rng;

    // simple “star families”
    const type = r();

    let colorA, colorB;

    // we need a bit more randomness in types - some at all for blue ! :)
    if (type < 0.33) {
      this.type = "red";
      // red/orange dwarf
      colorA = [1.0, 0.3 + r() * 0.2, 0.05];
      colorB = [1.0, 0.7, 0.2];
    } else if (type < 0.66) {
      this.type = "yellow";
      // yellow star
      colorA = [1.0, 0.6 + r() * 0.2, 0.1];
      colorB = [1.0, 0.85 + r() * 0.1, 0.3 + r() * 0.1];
    } else {
      this.type = "blue";
      // blue/white
      colorA = [0.6, 0.8, 1.0];
      colorB = [1.0, 1.0, 1.0];
    }

    return { colorA, colorB };
  }

  // -------------------------
  // ✨ Energy
  // -------------------------
  generateEnergy() {
    const r = this._rng;

    return {
      brightness: 0.8 + r() * 0.6,
      contrast: 0.8 + r() * 0.4
    };
  }
}
