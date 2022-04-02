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
    vec3 X = dFdx(vNormal);
    vec3 Y = dFdy(vNormal);
    vec3 normal = normalize(cross(X, Y));

    float diffuse = dot(normal, vec3(1.0));
    vec2 rand = hash22(vec2(floor(diffuse * 10.0)));
    vec2 uvv = vec2(
        sign(rand.x - 0.5) * 1. + (rand.x - 0.5) * .6,
        sign(rand.y - 0.5) * 1. + (rand.y - 0.5) * .6
    );

    float fresnel = pow(dot(eyeVector, normal), 1.0);
    vec2 uv = uvv * gl_FragCoord.xy/vec2(1920.0, 960.0);
    vec3 refracted = refract(eyeVector, normal, 1.0/3.0);
    uv += 0.2 * refracted.xy;

    vec4 texturePic = texture2D(uPicture, uv);
//    gl_FragColor = vec4(eyeVector, 1.0);
    gl_FragColor = texturePic * (0.5 - fresnel); //значение затемнения
//    gl_FragColor = texturePic * fresnel;
//    gl_FragColor = texturePic;
//    gl_FragColor = vec4(vBary, 1.0);
}