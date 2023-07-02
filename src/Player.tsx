import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Vector3, Euler } from "three";
import type { Object3D } from "three";
import { easeOutExpo, reverseEaseOutExpo } from "./easing";

const settings = {
  sensibility: 1.5,
  controls: {
    forward: "Z",
    backward: "S",
    left: "Q",
    right: "D",
  },
};

const directionsToRadian = (keys: Array<string>): number | null => {
  const lengths: Array<[number, number]> = keys.map((key) => {
    switch (key) {
      case settings.controls.forward:
        return [1, 0];
      case settings.controls.backward:
        return [-1, 0];
      case settings.controls.left:
        return [0, 1];
      case settings.controls.right:
        return [0, -1];
      default:
        return [0, 0];
    }
  });
  const [adjacent, opposite] = lengths.reduce(
    ([advance, strafe], [adv, str]) => [advance + adv, strafe + str],
    [0, 0]
  );

  if (adjacent === 0 && opposite === 0) {
    return null;
  }

  // Cheating a bit, because 0/-1 makes the player move forward
  if (adjacent === -1 && opposite === 0) {
    return -Math.PI;
  }

  return Math.atan(opposite / adjacent);
};

const Player = () => {
  // All sizes are in m
  // All durations are in s
  // All speeds are in m/s
  // All accelerations are in m/s/s
  const { current: player } = useRef({
    height: 1.8,
    acceleration: 0.35,
    deceleration: 0.5,
    runningSpeed: 2.6,
    rotationSpeed: Math.PI * 4,
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
      if (
        document.pointerLockElement === document.body &&
        // For some reason, the event happens even when the key is already pressed
        !player.keysPressed.includes(event.key.toUpperCase())
      ) {
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
      // Changing the player's momentum based on the key pressed
      const direction = directionsToRadian(player.keysPressed);
      if (direction !== null) {
        player.momentum.speed =
          easeOutExpo(
            reverseEaseOutExpo(player.momentum.speed / player.runningSpeed) +
              player.acceleration
          ) * player.runningSpeed;

        player.momentum.direction = player.rotation.y + direction;
      } else {
        player.momentum.speed = Math.max(
          0,
          easeOutExpo(
            reverseEaseOutExpo(player.momentum.speed / player.runningSpeed) -
              player.deceleration
          ) * player.runningSpeed
        );
      }

      // Updating the player position based on their momentum
      player.position.z -=
        player.momentum.speed * delta * Math.cos(player.momentum.direction);
      player.position.x -=
        player.momentum.speed * delta * Math.sin(player.momentum.direction);

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
