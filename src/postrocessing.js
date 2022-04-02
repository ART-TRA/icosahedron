const PostProcessing = {
  uniforms: {
    'tDiffuse': {value: null},
    'resolution': {value: null},
    'pixelSize': {value: 1},
    'uTime': {value: 0},
    'uMouse': {value: 0},
  },

  vertexShader: `
		varying highp vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,

  fragmentShader: `
		uniform sampler2D tDiffuse;
		uniform float pixelSize;
		uniform vec2 resolution;
		uniform float uTime;
		uniform float uMouse;
		varying highp vec2 vUv;
		
		float hash(vec2 p) { 
		  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); 
		}
		
		void main(){
		  //noise
		  float backgroundNoise = hash(vUv + uTime) * 0.1;
		  
		  //rgb shift
		  vec2 shift = vec2(0.002, 0.002) * uMouse;
		  
		  //black and white picture
		  vec4 t = texture2D(tDiffuse, vUv);
		  vec4 t1 = texture2D(tDiffuse, vUv + shift);
		  vec4 t2 = texture2D(tDiffuse, vUv - shift);
		  
		  vec3 color = vec3((t.r + t.g + t.b)/2.0);
		  vec3 color1 = vec3((t1.r + t1.g + t1.b)/2.0);
		  vec3 color2 = vec3((t2.r + t2.g + t2.b)/2.0);
		  color = vec3(color1.r, color.g, color2.b);
		
			vec2 dxy = pixelSize / resolution;
			vec2 coord = dxy * floor( vUv / dxy );
			gl_FragColor = texture2D(tDiffuse, vUv);
			gl_FragColor = vec4(color + vec3(backgroundNoise), 1.0);
		}`
};

export { PostProcessing };