import { useRef } from 'react'
import { useTexture, Plane } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber';

export default function Logo() {
	const [logo] = useTexture(['/images/logo.png'])
	const logoRef = useRef<THREE.Mesh>(null);


	useFrame(({ camera }) => {
		if (logoRef.current) {
			logoRef.current.lookAt(camera.position);
		}
	});

	return (
		<group>
			<Plane args={[5, 2]} position={[-15, 2, -10]} ref={logoRef} >
				<meshBasicMaterial map={logo} side={THREE.FrontSide} transparent />
			</Plane>
		</group>
	)
}
