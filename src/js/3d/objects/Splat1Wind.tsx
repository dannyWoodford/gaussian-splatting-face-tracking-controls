import React, { useEffect, useRef, useMemo } from 'react'
import { LumaSplatsThree } from "@lumaai/luma-web";
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three'
import { MathUtils as ThreeMathUtils } from 'three';


export default function Splat1Wind() {
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





	const { camera } = useThree();

	const uniformTime = useMemo(() => new THREE.Uniform(0), []);

	const splats = useMemo(() =>
		new LumaSplatsThree({
			// Chateau de Menthon - Annecy @Yannick_Cerrutti
			source: 'https://lumalabs.ai/capture/a68f48e0-026f-4701-933c-457678434414',
			enableThreeShaderIntegration: true,
			onBeforeRender: () => {
				uniformTime.value = performance.now() / 1000;
			},
			// position: [1.5, 0.6, -0.8],
			// rotation: [0, 2.4, 0],
			// scale: 1,
			particleRevealEnabled: true,

		})
		, [uniformTime])

	splats.setShaderHooks({
		vertexShaderHooks: {
			additionalUniforms: {
				time_s: ['float', uniformTime],
			},
			getSplatTransform: /*glsl*/`
        (vec3 position, uint layersBitmask) {
          // sin wave on x-axis
          float x = 0.;
          float z = 0.;
          float y = sin(position.x * 1.0 + time_s) * 0.1;
          return mat4(
            1., 0., 0., 0,
            0., 1., 0., 0,
            0., 0., 1., 0,
            x,  y,  z, 1.
          );
        }
      `,
		}
	});

	splats.onInitialCameraTransform = transform => {
		camera.matrix.copy(transform);
		camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
		camera.updateMatrixWorld();
	};

	useEffect(() => {
		if (boxRef.current) {
			boxRef.current.add(splats);

			splats.position.set(1.5, 0.6, -0.8);
			splats.rotation.set(0, 2.4, 0);
		}
	}, [splats])

	return (
		<group name="lumaSplats Group" ref={boxRef}>
		</group>
	);
}
