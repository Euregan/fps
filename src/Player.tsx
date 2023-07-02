import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Vector3, Euler } from "three";
import type { Object3D } from "three";

const settings = {
  sensibility: 1.5,
  controls: {
    forward: "Z",
    backward: "S",
    left: "Q",
    right: "D",
  },
};

const Player = () => {
  const { current: player } = useRef({
    height: 0.8,
    speed: 3.5,
    acceleration: 0.0035,
    deceleration: 0.005,
    runningSpeed: 0.005,
    momentum: {
      direction: 0,
      speed: 0,
    },
    position: new Vector3(0, 0, 0),
    rotation: new Euler(0, 0, 0),
    keysPressed: [] as Array<string>,
  });
  player.rotation.order = "YXZ";

  useEffect(() => {
    const onDocumentClick = () => document.body.requestPointerLock();
    document.addEventListener("click", onDocumentClick);

    const onPointerLockChange = () => (player.keysPressed = []);
    document.addEventListener("pointerlockchange", onPointerLockChange, false);

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement === document.body) {
        player.rotation.y -= (event.movementX / 1000) * settings.sensibility;
        player.rotation.x = Math.min(
          Math.PI / 2,
          Math.max(
            -Math.PI / 2,
            player.rotation.x - (event.movementY / 1000) * settings.sensibility
          )
        );
      }
    };
    document.addEventListener("mousemove", onMouseMove);

    const onKeyDown = (event: KeyboardEvent) => {
      if (document.pointerLockElement === document.body) {
        player.keysPressed.push(event.key.toUpperCase());
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const onKeyUp = (event: KeyboardEvent) => {
      if (document.pointerLockElement === document.body) {
        player.keysPressed = player.keysPressed.filter(
          (key) => key !== event.key.toUpperCase()
        );
      }
    };
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const camera = useRef<Object3D>();

  useFrame((state, delta) => {
    if (camera.current) {
      // Changing the player's position based on the key pressed
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

      console.log(player.position.x, player.position.z);
      // Updating the camera position
      camera.current.position.set(
        player.position.x,
        player.position.y + player.height,
        player.position.z
      );

      // Updating the camera rotation
      camera.current.rotation.set(
        player.rotation.x,
        player.rotation.y,
        player.rotation.z
      );
    }
  });

  return (
    <>
      <PerspectiveCamera
        ref={camera}
        makeDefault
        position={[
          player.position.x,
          player.position.y + player.height,
          player.position.z,
        ]}
        rotation={player.rotation}
      />
    </>
  );
};

export default Player;
