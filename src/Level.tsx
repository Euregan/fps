import { useMemo } from "react";
import { Euler, Vector3 } from "three";

const Level = () => {
  const floorSize = {
    width: 20,
    depth: 20,
  };

  const boxCount = 10;

  const boxes = useMemo(
    () =>
      [...Array(boxCount).keys()].map(
        () =>
          new Vector3(
            (Math.random() - 0.5) * floorSize.width,
            0.5,
            (Math.random() - 0.5) * floorSize.depth
          )
      ),
    []
  );

  return (
    <group>
      <ambientLight intensity={0.2} />
      <pointLight
        args={[0xffffff, 0.7, Math.min(floorSize.width, floorSize.depth) / 1.5]}
        position={[0, 3, 0]}
        intensity={0.9}
        castShadow
      />

      <mesh rotation={new Euler(-Math.PI / 2)} receiveShadow>
        <planeGeometry args={[floorSize.width, floorSize.depth]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>

      {boxes.map((box, index) => (
        <mesh key={index} position={box} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={0x0000ff} />
        </mesh>
      ))}
    </group>
  );
};

export default Level;
