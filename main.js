import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';






const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const loader = new THREE.TextureLoader();
loader.load('premium_photo-1680582107403-04dfac02efc3.jpg', function(texture) {
  scene.background = texture;
});


renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('istockphoto-1640602841-612x612.png');


const material = new THREE.MeshBasicMaterial({ map: texture });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


camera.position.z = 2;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.007;
  cube.rotation.y += 0.007;
  renderer.render(scene, camera);
}
animate();
