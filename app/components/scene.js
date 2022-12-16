import Component from '@glimmer/component';
import { next } from '@ember/runloop';
import * as THREE from 'three';

// renderer
let renderer = null;

// camera
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

// scene
const scene = new THREE.Scene();

// box geometry
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

// light
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const cubes = [
  makeInstance(geometry, 0x44aa88, 0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844, 2),
];

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = canvas.clientWidth * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({ color });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}

const render = (time) => {
  time *= 0.001;  // convert time to seconds

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}


export default class SceneComponent extends Component {

  constructor() {
    super(...arguments)
    this.setupScene()
  }


  setupScene() {
    // allow the DOM to render before trying to access the canvas
    next(this, () => {
      const canvas = document.querySelector('#scene')
      renderer = new THREE.WebGLRenderer({ canvas });
      renderer.render(scene, camera);
      render()
    })
  }


}
