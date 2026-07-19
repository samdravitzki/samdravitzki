precision highp float;

attribute vec3 aPosition;

// The transform of the object being drawn
uniform mat4 uModelViewMatrix;

// Transforms 3D coordinates to
// 2D screen coordinates
uniform mat4 uProjectionMatrix;

void main() {
   // Apply the camera transform
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);

  // Tell WebGL where the vertex goes
  gl_Position = uProjectionMatrix * viewModelPosition;
}