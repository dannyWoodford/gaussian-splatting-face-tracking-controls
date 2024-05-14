import React, { useEffect, useRef } from 'react'
import { Object3DNode, extend, useFrame } from '@react-three/fiber';
import { LumaSplatsThree, LumaSplatsSemantics } from "@lumaai/luma-web";
import * as THREE from 'three'
import { MathUtils as ThreeMathUtils } from 'three';


// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree });

// For typeScript support:
declare module '@react-three/fiber' {
	interface ThreeElements {
		lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
	}
}

export default function Splat2() {
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
			targetRotation.current.y += 0.005;

			const { rotation } = boxRef.current;
			rotation.x = ThreeMathUtils.lerp(rotation.x, targetRotation.current.x, 0.1);
			// rotation.y = ThreeMathUtils.lerp(rotation.y, targetRotation.current.y, 0.1);
			rotation.y = ThreeMathUtils.lerp(rotation.y, targetRotation.current.y, 0.1);
		}
	});

	return (
		<group name="lumaSplats Group" ref={boxRef}>
			<lumaSplats
				semanticsMask={LumaSplatsSemantics.FOREGROUND | LumaSplatsSemantics.BACKGROUND}
				// semanticsMask={LumaSplatsSemantics.FOREGROUND}
				source='https://lumalabs.ai/capture/9ec5306a-4bd3-46fe-9522-1f8a1281f6b3'
				// position={[-2, -0.37, 1.5]}
				// rotation={[0, 2.6, 0]}

				position={[0, 1, 0]}
				rotation={[0, 1.9, 0]}
				scale={3}
				particleRevealEnabled={true}
			/>
		</group>
	);
}
