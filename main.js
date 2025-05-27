import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Hintergrundbild
const loader = new THREE.TextureLoader();
loader.load('premium_photo-1680582107403-04dfac02efc3.jpg', function (texture) {
  scene.background = texture;
});

// Würfel mit Textur
const geometry = new THREE.BoxGeometry();
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('istockphoto-1640602841-612x612.png');
const material = new THREE.MeshBasicMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Kamera-Position
camera.position.z = 2;

// OrbitControls aktivieren
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update(); // wichtig für Maussteuerung
  renderer.render(scene, camera);
}
animate();

// Responsives Verhalten
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
