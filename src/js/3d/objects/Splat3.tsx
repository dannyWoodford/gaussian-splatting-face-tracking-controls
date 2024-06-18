import React, { useEffect, useRef, useState } from 'react'
import { Object3DNode, extend, useFrame } from '@react-three/fiber';
import { LumaSplatsThree, LumaSplatsSemantics } from "@lumaai/luma-web";
import { a, useSpring, useSpringRef } from "@react-spring/three";

import { useCanvas } from '../../../context/CanvasContext'

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

export default function Splat3() {
	const { setScrollNumber } = useCanvas()
	const [initialAnimation, setInitialAnimation] = useState(false)

	const boxRef = useRef<THREE.Group>(null);
	const animationRef = useRef<THREE.Group>(null);
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
			
			const { rotation } = boxRef.current;
			rotation.x = ThreeMathUtils.lerp(rotation.x, targetRotation.current.x, 0.1);
			rotation.y = ThreeMathUtils.lerp(rotation.y, targetRotation.current.y, 0.1);
			
			if (initialAnimation) {
				targetRotation.current.y += 0.003;
			}
		}
	});

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setInitialAnimation(true)
		}, 3500)

		return () => clearTimeout(timeoutId)
	}, [setScrollNumber]);

	const api = useSpringRef();
	const springs = useSpring({
		ref: api,
		from: { rotation: [0, 0, 0], position: [0, 0, 0] },
	});


	useEffect(() => {
		if (initialAnimation) {
			api.start({
				to: {
					rotation: [-0.83, -2.15, 0],
					position: [0, 0.8, 0],
				},
				config: {
					tension: 280,
					friction: 180,
					// precision: 0.0001,
					clamp: true,
				},
				onRest: () => {
					setScrollNumber(22)
				}
			});
		}
	}, [initialAnimation, api, setScrollNumber]);

	return (
		<group name="lumaSplats Group" ref={boxRef}>
			<a.group ref={animationRef} rotation={springs.rotation as unknown as THREE.Euler} position={springs.position as unknown as THREE.Vector3}>
				<lumaSplats
					semanticsMask={LumaSplatsSemantics.FOREGROUND | LumaSplatsSemantics.BACKGROUND}
					// semanticsMask={LumaSplatsSemantics.FOREGROUND}
					source='https://lumalabs.ai/capture/d80d4876-cf71-4b8a-8b5b-49ffac44cd4a'

					position={[0, 0, 0]}
					rotation={[0, 1.9, 0]}
					scale={3}
					particleRevealEnabled={true}
				/>
			</a.group>
		</group>
	);
}
