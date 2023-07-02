import { Canvas } from "@react-three/fiber";
import Level from "./Level";
import Player from "./Player";

export default function App() {
  return (
    <Canvas shadows>
      <Level />
      <Player />
    </Canvas>
  );
}
