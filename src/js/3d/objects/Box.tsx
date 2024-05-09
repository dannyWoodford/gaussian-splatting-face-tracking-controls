import React, { useRef, useState } from 'react';
import { useFrame } from "@react-three/fiber";
import { Mesh } from 'three';

interface BoxProps {
  position?: [number, number, number];
}

const Box: React.FC<BoxProps> = ({ position }) => {
  const ref = useRef<Mesh>(null); // Add type annotation for ref
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.02;
    }
  });

  return (
    <mesh
      position={position}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => setClicked(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), setHovered(true))}
      onPointerOut={() => setHovered(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
};

export default Box;
