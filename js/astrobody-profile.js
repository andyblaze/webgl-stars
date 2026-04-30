export default class AstroBodyProfile {
  constructor(seed) {
    this.seed = seed;

    this._rng = this.createRNG(seed);
  }

  // -------------------------
  // Deterministic RNG
  // -------------------------
  createRNG(seed) {
    return function () {
      seed = Math.sin(seed * 9999.0) * 43758.5453;
      return seed - Math.floor(seed);
    };
  }
}