import React, { useEffect } from "react";
import { useThree } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'

export default function Background() {
	const { scene } = useThree()

	useEffect(() => {
		scene.fog = new THREE.FogExp2(new THREE.Color('black').convertLinearToSRGB(), 0.04)
		scene.background = scene.fog.color
	}, [scene])

	return (
		<group name="Background">

			<group name="Background Sphere" >
				<ambientLight intensity={1} />

				<Sphere
					args={[400]}
					position={[0, 0, 0]}
					name='boundary-sphere'
				>
					<meshBasicMaterial side={THREE.BackSide} color={"#1a1110"} />
				</Sphere>
			</group>
		</group>
	);
}
