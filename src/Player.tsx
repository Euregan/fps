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
    // This is going to be multiplied by the delta, so we keep it small
    speed: 0.005,
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

    return () => {
      document.removeEventListener("mousemove", onMouseMove);

      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
    };
  }, []);

  const camera = useRef<Object3D>();

  useFrame((state, delta) => {
    if (camera.current) {
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
