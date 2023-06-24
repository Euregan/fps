import * as THREE from "three";
import GUI from "lil-gui";

const gui = new GUI();
const settings = {
  sensibility: 1.5,
  controls: {
    forward: "Z",
    backward: "S",
    left: "Q",
    right: "D",
  },
};
gui.add(settings, "sensibility").min(0.1).step(0.1).max(100);

/**
 * Base
 */
// Canvas
const canvas = document.getElementById("fps");

if (!canvas) {
  throw "No canvas found :(";
}

canvas.addEventListener("click", () => canvas.requestPointerLock());
document.addEventListener(
  "pointerlockchange",
  () => {
    player.keysPressed = [];
  },
  false
);

// Scene
const scene = new THREE.Scene();

/**
 * Environment
 */
const floorSize = {
  width: 20,
  depth: 20,
};

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(floorSize.width, floorSize.depth),
  new THREE.MeshBasicMaterial({ color: 0xffffff })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Positioning random boxes
const boxCount = 10;
for (let index = 0; index < boxCount; index++) {
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
  );

  box.position.y = 0.5;
  box.position.x = (Math.random() - 0.5) * floorSize.width;
  box.position.z = (Math.random() - 0.5) * floorSize.depth;

  scene.add(box);
}

/**
 * Sizes
 */
const viewport = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;

  // Update camera
  camera.aspect = viewport.width / viewport.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(viewport.width, viewport.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Controls
 */
const player = {
  height: 0.8,
  // This is going to be multiplied by the delta, so we keep it small
  speed: 0.005,
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  keysPressed: [] as Array<string>,
};

// If the mouse is locked, we move the camera on mouse move
document.addEventListener("mousemove", (event) => {
  if (document.pointerLockElement === canvas) {
    player.rotation.y -= (event.movementX / 1000) * settings.sensibility;
    player.rotation.x = Math.min(
      Math.PI / 2,
      Math.max(
        -Math.PI / 2,
        player.rotation.x - (event.movementY / 1000) * settings.sensibility
      )
    );
  }
});
// If the mouse is locked, we move the camera on keyboard presses
document.addEventListener("keydown", (event) => {
  if (document.pointerLockElement === canvas) {
    player.keysPressed.push(event.key.toUpperCase());
  }
});
document.addEventListener("keyup", (event) => {
  if (document.pointerLockElement === canvas) {
    player.keysPressed = player.keysPressed.filter(
      (key) => key !== event.key.toUpperCase()
    );
  }
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  viewport.width / viewport.height,
  0.1,
  Math.max(floorSize.width, floorSize.depth)
);
camera.position.set(
  player.position.x,
  player.position.y + player.height,
  player.position.z
);
camera.rotation.order = "YXZ";
camera.rotation.set(player.rotation.x, player.rotation.y, player.rotation.z);
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(viewport.width, viewport.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
let previousTime = Date.now();

const tick = () => {
  const now = Date.now();
  const delta = now - previousTime;

  // Updating player position
  if (player.keysPressed.includes(settings.controls.forward)) {
    player.position.z -= player.speed * delta * Math.cos(player.rotation.y);
    player.position.x -= player.speed * delta * Math.sin(player.rotation.y);
  }
  if (player.keysPressed.includes(settings.controls.backward)) {
    player.position.z += player.speed * delta * Math.cos(player.rotation.y);
    player.position.x += player.speed * delta * Math.sin(player.rotation.y);
  }
  if (player.keysPressed.includes(settings.controls.left)) {
    player.position.z += player.speed * delta * Math.sin(player.rotation.y);
    player.position.x -= player.speed * delta * Math.cos(player.rotation.y);
  }
  if (player.keysPressed.includes(settings.controls.right)) {
    player.position.z -= player.speed * delta * Math.sin(player.rotation.y);
    player.position.x += player.speed * delta * Math.cos(player.rotation.y);
  }

  // Updating player's camera
  camera.position.set(
    player.position.x,
    player.position.y + player.height,
    player.position.z
  );
  camera.rotation.set(player.rotation.x, player.rotation.y, player.rotation.z);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  previousTime = now;
  window.requestAnimationFrame(tick);
};

tick();
