varying vec2 vUv;

uniform mat3 uvTransform;
uniform float u_time;
uniform float u_aspect;

uniform sampler2D u_map;
uniform sampler2D u_distortionMap;
uniform float u_noiseScale;
uniform float u_ripple;
uniform float u_distortion;

#define PI 3.1415926538

void main() {
  float time = u_time * 0.0075;

  vec4 distortionTexel = texture2D(u_distortionMap, vUv);

  float distortionNoise = snoise(vec3(vUv * u_noiseScale, distortionTexel.a));

  float rippleTheta = distortionTexel.a * u_ripple * PI;
  vec2 ripple = vec2(sin(rippleTheta), sin(rippleTheta)) * distortionNoise;

  vec2 transformedUv = (uvTransform * vec3(vUv, 1)).xy;
  vec2 uv = transformedUv + ripple * distortionTexel.a * u_distortion * distortionNoise;

  vec4 texel = texture2D(u_map, uv);

  gl_FragColor = texel;
}
