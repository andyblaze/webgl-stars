import AstroBodyProfile from "./astrobody-profile.js";

export default class PlanetProfile extends AstroBodyProfile {
  constructor(seed, star) {
    super(seed);
    this.star = star; 

    this.type = this.pickType();
    this.size = this.generateSize();
    this.color = this.generateColor();
    this.orbit = this.generateOrbit();
  }
toUniforms() {
  return {};
}
getSize()  {
    return this.size;
}
getOrbit() {
    return this.orbit;
}
getStarPos() {
    return this.star.mesh.position;
}
generateOrbit() {
    const r = this._rng;

    return {
        radius: 0.5 + r() * 1.5,   // distance from star
        angle: r() * Math.PI * 2,   // position around star
        speed: Math.random()
    };
}

  // -------------------------
  // 🪐 Planet type (very simple)
  // -------------------------
  pickType() { 
    const r = this._rng();

    if (r < 0.6) return "rocky";
    if (r < 0.9) return "earthlike";
    return "gas";
  }

  // -------------------------
  // 📏 Size (relative, not real units)
  // -------------------------
  generateSize() {
    const r = this._rng();

    if (this.type === "rocky") return 0.1 + r * 0.2;
    if (this.type === "earthlike") return 0.2 + r * 0.2;
    return 0.4 + r * 0.4; // gas giants bigger
  }

  // -------------------------
  // 🎨 Color (influenced by star)
  // -------------------------
  generateColor() { 
    const r = this._rng(); //return [0.1 + r*0.2, 0.3 + r*0.4, 0.1 + r*0.2];

    const starType = this.star.getType(); // ← this is why we added it earlier

    let base;

    if (this.type === "rocky") {
      base = [0.3 + r*0.2, 0.25 + r*0.2, 0.2 + r*0.2];
    }

    if (this.type === "earthlike") {
      base = [0.1 + r*0.2, 0.3 + r*0.4, 0.1 + r*0.2];
    }

    if (this.type === "gas") {
      base = [0.6 + r*0.3, 0.5 + r*0.3, 0.3 + r*0.3];
    }

    // -------------------------
    // 🌟 Star influence (simple but powerful)
    // -------------------------
    if (starType === "red") {
      base[0] += 0.2; // warmer tint
    }

    if (starType === "blue") {
      base[2] += 0.2; // cooler tint
    }

    return base;
  }
}