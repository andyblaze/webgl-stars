export default class PlanetUniforms {
  constructor(three) {
    this.three = three;
    this._data = {
        
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
    return this;
}
  data() {
    return this._data;
  }
}
