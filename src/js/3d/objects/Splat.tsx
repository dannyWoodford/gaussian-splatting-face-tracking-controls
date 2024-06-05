import React, { useEffect, useRef } from 'react'
import { Object3DNode, extend, useFrame } from '@react-three/fiber';
import { LumaSplatsThree, LumaSplatsSemantics } from "@lumaai/luma-web";
import * as THREE from 'three'
import { MathUtils as ThreeMathUtils } from 'three';

import Logo from './Logo'

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
	const targetRotation = new THREE.Vector3()

	const handleMouseMove = (event: MouseEvent) => {
		if (event.buttons === 1 && boxRef.current) { // Check if left mouse button is pressed
			const { movementX, movementY } = event;

			targetRotation.y += movementX * 0.01;
			targetRotation.x += movementY * 0.01;
		}
	};

  useEffect(() => {
    window.addEventListener('pointermove', handleMouseMove);

    return () => {
      window.removeEventListener('pointermove', handleMouseMove);
    };
  }); // Add an empty dependency array to ensure the effect runs only once


	const newCamPos = new THREE.Vector3()

	useFrame((state) => {
		if (boxRef.current) {
			const { rotation } = boxRef.current;

			rotation.x = ThreeMathUtils.lerp(rotation.x, targetRotation.x, 0.1);
			rotation.y = ThreeMathUtils.lerp(rotation.y, targetRotation.y, 0.1);
		}

		state.camera.position.lerp(newCamPos.set(state.pointer.x * 30, state.camera.position.y, state.pointer.y * 200), 0.005)
	});


	return (
		<group name="lumaSplats Group" ref={boxRef}>
			<lumaSplats
				semanticsMask={LumaSplatsSemantics.FOREGROUND | LumaSplatsSemantics.BACKGROUND}
				// semanticsMask={LumaSplatsSemantics.FOREGROUND}
				source='https://lumalabs.ai/capture/a68f48e0-026f-4701-933c-457678434414'
				position={[1.5, 0.6, -0.8]}
				rotation={[0, 2.4, 0]}
				scale={1}
				particleRevealEnabled={true}
			/>

			<Logo />
		</group>
	);
}
