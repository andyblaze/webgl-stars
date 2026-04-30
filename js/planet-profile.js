export default class PlanetProfile {
  constructor(seed, starProfile) {
    this.seed = seed;
    this.star = starProfile;

    this._rng = this.createRNG(seed);

    this.type = this.pickType();
    this.size = this.generateSize();
    this.color = this.generateColor();
  }

  // -------------------------
  // RNG (same style as StarProfile)
  // -------------------------
  createRNG(seed) {
    return function () {
      seed = Math.sin(seed * 9999.0) * 43758.5453;
      return seed - Math.floor(seed);
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

    if (this.type === "rocky") return 0.1 + r() * 0.2;
    if (this.type === "earthlike") return 0.2 + r() * 0.2;
    return 0.4 + r() * 0.4; // gas giants bigger
  }

  // -------------------------
  // 🎨 Color (influenced by star)
  // -------------------------
  generateColor() {
    const r = this._rng();

    const starType = this.star.starType; // ← this is why we added it earlier

    let base;

    if (this.type === "rocky") {
      base = [0.3 + r()*0.2, 0.25 + r()*0.2, 0.2 + r()*0.2];
    }

    if (this.type === "earthlike") {
      base = [0.1 + r()*0.2, 0.3 + r()*0.4, 0.1 + r()*0.2];
    }

    if (this.type === "gas") {
      base = [0.6 + r()*0.3, 0.5 + r()*0.3, 0.3 + r()*0.3];
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