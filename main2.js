import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Kamera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Licht
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// GLTF Modell laden
const loader = new GLTFLoader();
let mixer;

loader.load(
  './Business Man.glb',
  function (gltf) {
    const model = gltf.scene;
    model.traverse((node) => {
      if (node.isMesh || node.isSkinnedMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);
    scene.add(model);

    // Richtige Zielstruktur für Animation finden
    let animationTarget = model;
    model.traverse((node) => {
      if (node.isSkinnedMesh) {
        animationTarget = node;
      }
    });

    // Animationen starten
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(animationTarget);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();

      console.log('Animation gestartet:', gltf.animations[0].name);
    } else {
      console.warn('Keine Animationen im GLB gefunden.');
    }

    // Debug-Ausgabe
    console.log('GLTF Szene:', model);
    console.log('GLTF Animationen:', gltf.animations.map(a => a.name));
  },
  undefined,
  function (error) {
    console.error('Fehler beim Laden des Modells:', error);
  }
);

// Animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
}
animate();

// Responsiv
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
