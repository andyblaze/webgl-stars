export default class Shaders {
    constructor() {

        this.hash = `
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
        }`;

        this.noise = `
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
        }`;

        this.fbm = `
        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 4; i++) {
                v += a * noise(p);
                p *= 2.0;
                a *= 0.5;
            }
            return v;
        }`;

        this.commonCode = `
        ${this.hash}
        ${this.noise}
        ${this.fbm}
        `;

        this.code = {

            // ⭐ STAR
            "star": {

                "vertex": `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,

                "fragment": `
                precision mediump float;

                varying vec2 vUv;

                uniform float time;
                uniform vec2 resolution;

                uniform vec2 flowDir;
                uniform float flowSpeed;

                uniform vec3 colorA;
                uniform vec3 colorB;
                uniform float brightness;

                ${this.commonCode}

                void main() {

                    // Object-space UV
                    vec2 uv = vUv * 2.0 - 1.0;

                    // Aspect correction (keeps circle circular)
                    //uv.x *= resolution.x / resolution.y;

                    float r = length(uv);
                    if (r > 1.0) discard;

                    float t1 = time * flowSpeed;
                    float t2 = time * (flowSpeed * 0.8 + 0.05);

                    vec2 warp = vec2(
                        fbm(uv * 2.0 + flowDir * t1),
                        fbm(uv * 2.0 - flowDir * t2)
                    );

                    vec2 p = uv + warp * 0.3;

                    float n =
                        fbm(p * 1.5 + time * 0.2) * 0.6 +
                        fbm(p * 3.0 - time * 0.4) * 0.3 +
                        fbm(p * 6.0 + time * 0.8) * 0.1;

                    float glow = smoothstep(1.0, 0.0, r);
                    float intensity = n * glow;

                    vec3 col = mix(colorA, colorB, intensity);
                    col = mix(col, vec3(1.0), pow(intensity, 3.0));
                    col *= glow * brightness;

                    gl_FragColor = vec4(col, 1.0);
                }`
            },

            // 🌍 PLANET
            "planet": {

                "vertex": `
                varying vec2 vUv;
                varying vec3 vNormal;

                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal); //vNormal = normal;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,

                "fragment": `
                precision mediump float;

varying vec2 vUv;
varying vec3 vNormal;
uniform vec3 lightDir;

${this.commonCode}

void main() {

    // ✅ REAL normal from sphere geometry
    vec3 normal = normalize(vNormal);

    // 💡 simple light direction (you can later replace this with star position)
    //vec3 lightDir = normalize(vec3(-0.6, 0.4, 1.0));

    //float diffuse = clamp(dot(normal, lightDir), 0.0, 1.0);
    //float diffuse = max(dot(normal, normalize(lightDir)), 0.0);

float diffuse = max(dot(vNormal, normalize(lightDir)), 0.0); // float diffuse = max(dot(normal, lightDir), 0.0);

float ambient = 0.2; // tweak 0.1–0.3

float lighting = diffuse + ambient;
lighting = clamp(lighting, 0.0, 1.0);
//vec3 col = baseColor * lighting;

    // 🌍 use UVs ONLY for surface pattern
    vec2 uv = vUv;

    float continents = fbm(uv * 4.0);
    float detail = fbm(uv * 10.0) * 0.3;

    float landMask = smoothstep(0.45, 0.55, continents + detail);

    vec3 ocean = vec3(0.05, 0.15, 0.35);
    vec3 land  = vec3(0.2, 0.5, 0.25);

    vec3 baseColor = mix(ocean, land, landMask);

    vec3 col = baseColor * lighting;

    // ☀️ lighting
    //vec3 col = baseColor * (diffuse * 0.9 + 0.1);

    // 🌑 night side fade
    //col *= smoothstep(0.0, 0.2, diffuse);

    // 🌌 atmosphere rim (based on view angle, not UV radius)
    //float rim = pow(1.0 - dot(normal, vec3(0.0, 0.0, 1.0)), 3.0);
    //col += vec3(0.3, 0.5, 1.0) * rim * 0.3;

    gl_FragColor = vec4(col, 1.0);

                }`
            }
        };
    }
}