uniform sampler2D uPicture;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 eyeVector;
varying vec3 vBary;

vec2 hash22(vec2 p) {
    p = fract(p * vec2(5.3983, 5.4427));
    p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
    return fract(vec2(p.x * p.y * 95.4337, p.x * p.y * 97.597));
}

void main() {
    float lineWidth = 1.5;
    vec3 d = fwidth(vBary);
    vec3 s = smoothstep(d*(lineWidth + 0.5), d*(lineWidth - 0.5), vBary);
    float line = max(s.x, max(s.y, s.z));

    if (line < 0.1) discard;
    gl_FragColor = vec4(mix(vec3(1.0), vec3(0.0), 1.0 - line), 1.0);
}