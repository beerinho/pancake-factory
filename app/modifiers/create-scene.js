import { modifier } from 'ember-modifier';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// renderer
let renderer = null;

// an array of objects whose rotation to update
const objects = [];

// camera
const fov = 40;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(1, 3, 5);
camera.up.set(0, 1, 0);
camera.lookAt(0, 0.25, 0);
const cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);
scene.add(cameraHolder);

// lights
{
  const color = 0xffffff;
  const intensity = 120;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-3, 3, 2);
  light.castShadow = true;
  scene.add(light);

  const light2 = new THREE.AmbientLight(color, 10);
  scene.add(light2);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

const render = (time) => {
  time *= 0.0005;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  cameraHolder.rotation.y = time / 2;
  objects.forEach((obj) => {
    obj.rotation.y = time;
  });

  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

const loader = new GLTFLoader();

loader.load('/models/ferris/ferris3d_v1.0.gltf', function (gltf) {

  scene.add(gltf.scene);

}, undefined, function (error) {

  console.error(error);

});

export default modifier(function createScene(
  element
) {
  renderer = new THREE.WebGLRenderer({ canvas: element });
  renderer.shadowMap.enabled = true;
  renderer.physicallyCorrectLights = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.render(scene, camera);
  render();
}, { eager: false });

