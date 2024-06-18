import React, { useEffect, useRef, useState } from 'react'
import { Object3DNode, extend, useFrame } from '@react-three/fiber';
import { LumaSplatsThree, LumaSplatsSemantics } from "@lumaai/luma-web";
import * as THREE from 'three'
import { MathUtils as ThreeMathUtils } from 'three';

// import { useCanvas } from '../../../context/CanvasContext'


// Make LumaSplatsThree available to R3F
extend({ LumaSplats: LumaSplatsThree });

// For typeScript support:
declare module '@react-three/fiber' {
	interface ThreeElements {
		lumaSplats: Object3DNode<LumaSplatsThree, typeof LumaSplatsThree>
	}
}

export default function Splat2() {
	// const { setScrollNumber } = useCanvas()

	const [initialAnimation, setInitialAnimation] = useState(false)

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

			if (targetRotation.current.y < 1.975 && !initialAnimation) {
				targetRotation.current.y += 0.005;
			} else if (!initialAnimation) {
				setInitialAnimation(true)
			} else {
				// targetRotation.current.y += 0.003;
			}
			const { rotation } = boxRef.current;
			rotation.x = ThreeMathUtils.lerp(rotation.x, targetRotation.current.x, 0.1);
			rotation.y = ThreeMathUtils.lerp(rotation.y, targetRotation.current.y, 0.1);
		}
	});

	// useEffect(() => {
	// 	// if you want this camera zoom
	// 	// set "reset scrollNumber" useEffect in Controls.js for "sceneIndex === 1" to 3
	// 	const timeoutId = setTimeout(() => {
	// 		setScrollNumber(8)
	// 	}, 2000)

	// 	return () => clearTimeout(timeoutId)
	// }, [setScrollNumber]);

	return (
		<group name="lumaSplats Group" ref={boxRef}>
			<lumaSplats
				semanticsMask={LumaSplatsSemantics.FOREGROUND | LumaSplatsSemantics.BACKGROUND}
				// semanticsMask={LumaSplatsSemantics.FOREGROUND}
				source='https://lumalabs.ai/capture/9ec5306a-4bd3-46fe-9522-1f8a1281f6b3'

				position={[0, 1.6, 0]}
				scale={2.95}
				particleRevealEnabled={true}
			/>
		</group>
	);
}
