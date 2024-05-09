import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { Group, Mesh } from "three";

export default function Loading() {
	const loadingGroup = useRef<Group>(null!);
	const loader = useRef<Mesh>(null!);

	useFrame(() => {
		if (loader.current) {
			loader.current.rotation.z -= 0.06;
			loadingGroup.current.rotation.y -= 0.006;
		}
	});

	const fontProps = { color: 'white', fontSize: 1, 'material-toneMapped': false }

	return (
		<group
			ref={loadingGroup}
			name="Loading"
			position={[0, 0.5, 0]}
			rotation={[0, Math.PI / 4, 0]}
			scale={[0.1, 0.1, 0.1]}
		>
			<mesh ref={loader}>
				<torusGeometry args={[4, 0.2, 16, 100, 4.5]} />
				<meshBasicMaterial color={"white"} toneMapped={false}/>
			</mesh>
			<Text
				anchorX={"center"}
				anchorY={"middle"}
				font={"https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"}
				{...fontProps}
			>
				Loading...
			</Text>
		</group>
	);
}
