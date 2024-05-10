import React, { useEffect, useRef } from 'react'
import { Object3DNode, extend, useFrame } from '@react-three/fiber';
import { LumaSplatsThree, LumaSplatsSemantics } from "@lumaai/luma-web";
import * as THREE from 'three'
import { MathUtils as ThreeMathUtils } from 'three';


import Background from '../setup/Background'

// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree });

// For typeScript support:
declare module '@react-three/fiber' {
	interface ThreeElements {
		lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
	}
}

export default function Splat() {
	const boxRef = useRef<THREE.Group>(null);
	const targetRotation = useRef({ x: 0, y: 0 });

	const handleMouseMove = (event: MouseEvent) => {
		if (event.buttons === 1 && boxRef.current) { // Check if left mouse button is pressed
			const { movementX, movementY } = event;

			targetRotation.current.y += movementX * 0.01;
			targetRotation.current.x += movementY * 0.01;
		}
	};

	useEffect(() => {
		window.addEventListener('pointermove', handleMouseMove);

		return () => {
			window.removeEventListener('pointermove', handleMouseMove);
		};
	}, []); // Add an empty dependency array to ensure the effect runs only once


	useFrame(() => {
		if (boxRef.current) {
			// targetRotation.current.y += 0.002;

			const { rotation } = boxRef.current;
			rotation.x = ThreeMathUtils.lerp(rotation.x, targetRotation.current.x, 0.1);
			rotation.y = ThreeMathUtils.lerp(rotation.y, targetRotation.current.y, 0.1);
		}
	});

	return (
		<group name="lumaSplats Group" ref={boxRef}>
			<lumaSplats
				semanticsMask={LumaSplatsSemantics.FOREGROUND | LumaSplatsSemantics.BACKGROUND}
				source='https://lumalabs.ai/capture/a68f48e0-026f-4701-933c-457678434414'
				// position={[-2, -0.37, 1.5]}
				// rotation={[0, 2.6, 0]}

				position={[1.5, 0.6, -0.8]}
				rotation={[0, 2.4, 0]}
				scale={1}
				particleRevealEnabled={true}
			/>

			<Background />
		</group>
	);
}
