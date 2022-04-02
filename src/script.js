import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Clock } from 'three'
import * as dat from 'dat.gui'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { PostProcessing } from './postrocessing'

import textureImage from './back.jpg'

let picture = new THREE.TextureLoader().load(textureImage)
picture.wrapT = THREE.MirroredRepeatWrapping
picture.wrapS = THREE.MirroredRepeatWrapping

import vertexShader from './shaders/ico/vertex.glsl'
import fragmentShader from './shaders/ico/fragment.glsl'
import lineFragmentShader from './shaders/lines/fragment.glsl'

// let mouse = new THREE.Vector2(0, 0)
let mouse = 0
const clock = new Clock()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 2000)
camera.position.set(0, 0, 2)
scene.add(camera)
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true //плавность вращения камеры

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //ограничение кол-ва рендеров в завис-ти от плотности пикселей
renderer.setClearColor('#1f1f25', 1)
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const customPass = new ShaderPass(PostProcessing);
customPass.uniforms["resolution"].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
customPass.uniforms["resolution"].value.multiplyScalar(window.devicePixelRatio);
composer.addPass(customPass);

window.addEventListener('resize', () => {
  //update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  //update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  //update renderer
  renderer.setSize(sizes.width, sizes.height)
  composer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

let lastX = 0;
let lastY = 0;
let speed = 0;
window.addEventListener('mousemove', (event) => {
  // mouse = {
  //   x: event.clientX / window.innerWidth - 0.5,
  //   y: event.clientY / window.innerHeight - 0.5,
  // }

  speed = (event.pageX - lastX) * 0.1
  lastX = event.pageX
})

//------------------------------------------------------------------------------------------------------

const icoGeometry = new THREE.IcosahedronBufferGeometry(1, 1)
const icoMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  // transparent: true,
  // depthWrite: false,
  // wireframe: true,
  // blending: THREE.AdditiveBlending,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: {value: 0},
    uPicture: {value: picture},
    uMouse: {value: 0}
  }
})

const linesMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  // transparent: true,
  // depthWrite: false,
  // wireframe: true,
  // blending: THREE.AdditiveBlending,
  vertexShader: vertexShader,
  fragmentShader: lineFragmentShader,
  uniforms: {
    uTime: {value: 0},
    uPicture: {value: picture},
    uMouse: {value: 0}
  }
})

const geometry1 = new THREE.IcosahedronBufferGeometry(1, 1)
const length = geometry1.attributes.position.array.length
let bary = []
for (let i = 0; i < length / 3; ++i) {
  bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0)
}
let aBary = new Float32Array(bary)
geometry1.setAttribute('aBary', new THREE.BufferAttribute(aBary, 3))

const ico = new THREE.Mesh(geometry1, icoMaterial)
const lines = new THREE.Mesh(geometry1, linesMaterial)
scene.add(ico)
scene.add(lines)


//---------------------------------------------------------------------------------------------------------

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  icoMaterial.uniforms.uTime.value = elapsedTime
  linesMaterial.uniforms.uTime.value = elapsedTime
  customPass.uniforms.uTime.value = elapsedTime
  customPass.uniforms.uMouse.value = mouse

  mouse -= (mouse - speed) * 0.05
  icoMaterial.uniforms.uMouse.value = mouse
  linesMaterial.uniforms.uMouse.value = mouse

  scene.rotation.x = elapsedTime * 0.1
  scene.rotation.y = elapsedTime * 0.1

  //Update controls
  controls.update() //если включён Damping для камеры необходимо её обновлять в каждом кадре

  // renderer.render(scene, camera)
  composer.render()
  window.requestAnimationFrame(tick)
}

tick()