import { modifier } from 'ember-modifier';
import * as THREE from 'three';
import { AxisGridHelper } from '../utils/axis-grid-helper';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const gui = new GUI();

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
camera.position.set(-10, 7.5, 20);
camera.up.set(0, 1, 0);
camera.lookAt(0, 0, 0);
const cameraHolder = new THREE.Object3D();
cameraHolder.add(camera);

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);
scene.add(cameraHolder);

// lights
{
  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-3, 3, 2);
  light.castShadow = true;
  scene.add(light);
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

function createCar() {
  console.log('creating car')
  const car = new THREE.Group();
  scene.add(car);

  const bodyGeometry = new THREE.BoxGeometry(10, 2, 5);
  const bodyMaterial = new THREE.MeshLambertMaterial({
    color: 0xce2f2d,
    emissive: 0xce2f2d,
    emissiveIntensity: 0.3,
  });
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  car.add(bodyMesh);

  // create cabin
  const cabinY = 1.9;
  const cabinGeometry = new THREE.BoxGeometry(5, cabinY, 4.5);
  const carFrontTexture = getCarFrontTexture();

  const carBackTexture = getCarFrontTexture();

  const carRightSideTexture = getCarSideTexture();

  const carLeftSideTexture = getCarSideTexture();
  carLeftSideTexture.center = new THREE.Vector2(0.5, 0.5);
  carLeftSideTexture.rotation = Math.PI;
  carLeftSideTexture.flipY = false;

  const cabin = new THREE.Mesh(cabinGeometry, [
    new THREE.MeshLambertMaterial({
      map: carFrontTexture,
      emissive: 0xffffff,
      emissiveMap: carFrontTexture,
      emissiveIntensity: 0.3,
    }),
    new THREE.MeshLambertMaterial({
      map: carBackTexture,
      emissive: 0xffffff,
      emissiveMap: carFrontTexture,
      emissiveIntensity: 0.3,
    }),
    new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
    }), // top
    new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
    }), // bottom
    new THREE.MeshLambertMaterial({
      map: carRightSideTexture,
      emissive: 0xffffff,
      emissiveMap: carRightSideTexture,
      emissiveIntensity: 0.3,
    }),
    new THREE.MeshLambertMaterial({
      map: carLeftSideTexture,
      emissive: 0xffffff,
      emissiveMap: carLeftSideTexture,
      emissiveIntensity: 0.3,
    }),
  ]);
  cabin.position.x = 1;
  cabin.position.y = cabinY;
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  car.add(cabin);

  // create tyres
  createTyre(car, -3.5, 2.3);
  createTyre(car, -3.5, -2.3);
  createTyre(car, 3.5, 2.3);
  createTyre(car, 3.5, -2.3);

  makeAxisGrid(car, 'car', 25);
}

function getCarFrontTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 60;
  const context = canvas.getContext('2d');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 120, 60);

  context.fillStyle = '#000000';
  context.fillRect(10, 10, 100, 50);

  return new THREE.CanvasTexture(canvas);
}

function getCarSideTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 60;
  const context = canvas.getContext('2d');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 200, 60);

  context.fillStyle = '#000000';
  context.fillRect(10, 10, 60, 50);
  context.fillRect(80, 10, 110, 50);

  return new THREE.CanvasTexture(canvas);
}

function createTyre(car, x, z) {
  const tyreGeometry = new THREE.CylinderGeometry(1, 1, 0.75, 4);
  const tyreMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const tyreMesh = new THREE.Mesh(tyreGeometry, tyreMaterial);
  tyreMesh.position.y = -1;
  tyreMesh.position.x = x;
  tyreMesh.position.z = z;
  tyreMesh.rotation.x = 1.57;
  car.add(tyreMesh);
  objects.push(tyreMesh);
}

function makeAxisGrid(node, label, units) {
  const helper = new AxisGridHelper(node, units);
  gui.add(helper, 'visible').name(label);
}

export default modifier(function createScene(
  element
) {
  renderer = new THREE.WebGLRenderer({ canvas: element });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.render(scene, camera);
  createCar();
  render();
}, { eager: false });

