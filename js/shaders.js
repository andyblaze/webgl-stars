export const shaders = {
    "star": {
        "vertex": `
            void main() {
                gl_Position = vec4(position, 1.0);
            }`,
        "fragment": `
        precision mediump float;
            uniform float time;
            uniform vec2 resolution;

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
            vec2 uv = gl_FragCoord.xy / resolution.xy;
            uv = uv * 2.0 - 1.0;
            uv.x *= resolution.x / resolution.y;

            float r = length(uv);
            if (r > 1.0) discard;

            vec2 warp = vec2(
                fbm(uv * 2.0 + time * 0.2),
                fbm(uv * 2.0 - time * 0.15)
            );

            vec2 p = uv + warp * 0.3;

            float n =
                fbm(p * 1.5 + time * 0.2) * 0.6 +
                fbm(p * 3.0 - time * 0.4) * 0.3 +
                fbm(p * 6.0 + time * 0.8) * 0.1;

            float glow = smoothstep(1.0, 0.0, r);
            float brightness = n * glow;

            vec3 col = mix(vec3(1.0, 0.3, 0.05), vec3(1.0, 0.8, 0.3), brightness);
            col = mix(col, vec3(1.0), pow(brightness, 3.0));
            col *= glow;

            gl_FragColor = vec4(col, 1.0);
            }`
    },
    "planet": {
        vertex: `
        varying vec2 vUv;
        void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragment: `
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
    }`
    }
}