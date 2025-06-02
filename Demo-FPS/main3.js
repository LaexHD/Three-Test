import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js';

let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();
const projectiles = [];

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 200, 0);
  scene.add(light);

  // Boden
  const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.name = "Floor";
  scene.add(floor);

  // Gegner (Boxen)
  const enemies = [];
  const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
  const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  for (let i = 0; i < 5; i++) {
    const box = new THREE.Mesh(boxGeometry, boxMaterial.clone());
    box.position.set(Math.random() * 100 - 50, 1, -Math.random() * 100);
    box.name = "Enemy";
    scene.add(box);
    enemies.push(box);
  }

  // Kamera & Controls
  camera.position.y = 10;
  controls = new PointerLockControls(camera, document.body);

  const instructions = document.getElementById('instructions');
  instructions.addEventListener('click', () => {
    controls.lock();
  });

  controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
  });

  controls.addEventListener('unlock', () => {
    instructions.style.display = '';
  });

  scene.add(controls.getObject());

  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyW': moveForward = true; break;
      case 'KeyS': moveBackward = true; break;
      case 'KeyA': moveLeft = true; break;
      case 'KeyD': moveRight = true; break;
    }
  });

  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyW': moveForward = false; break;
      case 'KeyS': moveBackward = false; break;
      case 'KeyA': moveLeft = false; break;
      case 'KeyD': moveRight = false; break;
    }
  });

  // Ball schießen
  document.addEventListener('mousedown', () => {
    if (!controls.isLocked) return;

    const ballGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);

    ball.position.copy(camera.position);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    projectiles.push({ mesh: ball, velocity: dir.multiplyScalar(2) });

    scene.add(ball);
  });

  // Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Crosshair
  const crosshair = document.createElement('div');
  crosshair.style.position = 'absolute';
  crosshair.style.top = '50%';
  crosshair.style.left = '50%';
  crosshair.style.width = '4px';
  crosshair.style.height = '4px';
  crosshair.style.marginLeft = '-2px';
  crosshair.style.marginTop = '-2px';
  crosshair.style.backgroundColor = 'white';
  crosshair.style.zIndex = '2';
  document.body.appendChild(crosshair);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  const speed = 400.0;

  if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  // Head-Bob Effekt
  if (moveForward || moveBackward || moveLeft || moveRight) {
    camera.position.y = 10 + Math.sin(clock.elapsedTime * 10) * 0.2;
  } else {
    camera.position.y = 10;
  }

  // Projektile bewegen
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.mesh.position.add(p.velocity.clone().multiplyScalar(delta * 50));

    // Kollision mit Gegnern
    const hits = scene.children.filter(obj =>
      obj.name === "Enemy" &&
      obj.position.distanceTo(p.mesh.position) < 1
    );
    if (hits.length > 0) {
      hits[0].material.color.set(0x00ff00); // Getroffen!
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
      continue;
    }

    // Entferne zu weit entfernte Projektile
    if (p.mesh.position.distanceTo(camera.position) > 100) {
      scene.remove(p.mesh);
      projectiles.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}
