import { Canvas } from "@react-three/fiber";
import Level from "./Level";

export default function App() {
  return (
    <Canvas shadows>
      <ambientLight intensity={0.5} />
      <pointLight position={[-10, -10, -10]} />
      <Level />
    </Canvas>
  );
}
