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
      <mesh rotation={new Euler(-Math.PI / 2)}>
        <planeGeometry args={[floorSize.width, floorSize.depth]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>
      {boxes.map((box) => (
        <mesh position={box}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={0x0000ff} />
        </mesh>
      ))}
    </group>
  );
};

export default Level;
