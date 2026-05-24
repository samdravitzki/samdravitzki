
precision highp float;

const float MAX_FLOAT = 3.402823466e38;
const int MAX_SHAPE_COUNT = 128;
uniform int u_shape_types[MAX_SHAPE_COUNT];
uniform vec2 u_shape_pos[MAX_SHAPE_COUNT];
uniform vec2 u_shape_size[MAX_SHAPE_COUNT];
uniform vec3 u_shape_fill[MAX_SHAPE_COUNT];
uniform int u_shape_count;
uniform bool u_debug;

float sdCircle(vec2 p, float radius) {
    return length(p) - radius;
}

float sdBox(vec2 p, vec2 size) {
    vec2 d = abs(p) - size;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1. - h);
}

// quadratic polynomial
// float smin( float a, float b, float k )
// {
//     k *= 4.0;
//     float h = max( k-abs(a-b), 0.0 )/k;
//     return min(a,b) - h*h*k*(1.0/4.0);
// }

// exponential
// float smin( float a, float b, float k )
// {
//     k *= 1.0;
//     float r = exp2(-a/k) + exp2(-b/k);
//     return -k*log2(r);
// }

const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 YELLOW_DARK = vec4(1.0, 0.79, 0.22, 1.0);
const vec4 YELLOW_LIGHT = vec4(1.0, 0.88, 0.4, 1.0);
const vec4 BLUE_DARK = vec4(0.54, 0.79, 1.0, 1.0);
const vec4 BLUE_LIGHT = vec4(0.76, 0.89, 1.0, 1.0);
const vec4 TRANSPARENT = vec4(0, 0, 0, 0);

void main() {
  float overallSignedDistance = MAX_FLOAT;
  vec3 colorSum = vec3(0.0);
  float weightSum = 0.0;

  for (int i = 0; i < MAX_SHAPE_COUNT; i++) {
    if (i > u_shape_count - 1) { break; }

    int type = u_shape_types[i];
    vec2 pos = u_shape_pos[i];
    vec2 size = u_shape_size[i];
    vec3 fill = u_shape_fill[i];

    float shapeSignedDistance = 0.0;

    if (type == 0) {
      shapeSignedDistance = sdCircle(pos - gl_FragCoord.xy, size.x);
    }

    if (type == 1) {
      shapeSignedDistance = sdBox(pos - gl_FragCoord.xy, size);
    }

    float weight = 25.0;

    overallSignedDistance = smin(overallSignedDistance, shapeSignedDistance, weight);

    vec2 distance = gl_FragCoord.xy - pos;

    float influence = exp(-length(distance) * 0.05);

    colorSum += fill * influence;
    weightSum += influence;
  }

  vec3 color = colorSum / weightSum;

  float insideMask = 1.0 - step(0.0, overallSignedDistance);

  if (u_debug) {
    float fragRes = floor(abs(mod(0.15*overallSignedDistance, 2.0)-1.0) + 0.5);
    vec4 insideColor = mix(BLUE_LIGHT, BLUE_DARK, abs(fragRes));
    vec4 outsideColor = mix(YELLOW_LIGHT, YELLOW_DARK, fragRes);
    gl_FragColor = mix(outsideColor, insideColor, insideMask);
  } else {
    gl_FragColor = mix(TRANSPARENT, vec4(color, 1.0), insideMask);
  }

    float outlineWidth = 3.0;
    float outlineMask = 1.0 - smoothstep(1.0, outlineWidth, abs(overallSignedDistance));
    // float outlineMask = 1.0 - step(outlineWidth, abs(overallSignedDistance));
    gl_FragColor = mix(gl_FragColor, RED, outlineMask);

}