import React, { useEffect } from 'react';
import { useCanvas } from '../../context/CanvasContext'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'


import Lighting from './setup/Lighting'
import Splat from './objects/Splat'

export default function Scene() {
	const { setCanvasLoaded } = useCanvas()

	  const { scene } = useThree() // This will just crash

		// Initialize and Reset timeline
		useEffect(() => {
			setCanvasLoaded(true)
		}, [setCanvasLoaded])

		useEffect(() => {
			scene.fog = new THREE.FogExp2(new THREE.Color("black").convertLinearToSRGB(), 0.04);
			scene.background = scene.fog.color;
		}, []);

	return (
		<>
			{/* <Lighting /> */}

			<OrbitControls enableDamping />
			<PerspectiveCamera makeDefault fov={75} position={[0,0,-5]}/>

			{/* <FaceControls offsetScalar={15} /> */}

			<Splat />
		</>
	);
}
