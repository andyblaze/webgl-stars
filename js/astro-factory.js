import StarProfile from "./star-profile.js";
import PlanetProfile from "./planet-profile.js";
import { Star, Planet } from "./astro-bodies.js";

export default class AstroBodyFactory {
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
    }
}