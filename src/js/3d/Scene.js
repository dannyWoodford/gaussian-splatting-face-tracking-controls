import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useCanvas } from '../../context/CanvasContext'
import { PerspectiveCamera, OrbitControls, FaceControls, useHelper } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { useControls, buttonGroup, folder } from 'leva'
import { easing } from 'maath'


import Lighting from './setup/Lighting'
import Splat from './objects/Splat'

export default function Scene() {
	const { setCanvasLoaded } = useCanvas()

	  const { scene, camera } = useThree() // This will just crash

		// Initialize and Reset timeline
		useEffect(() => {
			setCanvasLoaded(true)
		}, [setCanvasLoaded])

		useEffect(() => {
			scene.fog = new THREE.FogExp2(new THREE.Color('black').convertLinearToSRGB(), 0.028)
			scene.background = scene.fog.color
		}, [scene])


		  // const vids = ['https://storage.googleapis.com/abernier-portfolio/metahumans.mp4', 'https://storage.googleapis.com/abernier-portfolio/metahumans2.mp4']

			const gui = useControls({
				camera: { value: 'user', options: ['user', 'cc'] },
				// webcam: folder({
				// 	webcam: true,
				// 	autostart: true,
				// 	webcamVideoTextureSrc: {
				// 		value: vids[0],
				// 		options: vids,
				// 		optional: true,
				// 		disabled: true,
				// 	},
				// 	video: buttonGroup({
				// 		opts: {
				// 			pause: () => faceControlsApiRef.current?.pause(),
				// 			play: () => faceControlsApiRef.current?.play(),
				// 		},
				// 	}),
				// }),
				smoothTime: { value: 0.45, min: 0.000001, max: 1 },
				offset: true,
				offsetScalar: { value: 60, min: 10, max: 500 },
				eyes: false,
				eyesAsOrigin: true,
				// origin: { value: 0, optional: true, disabled: true, min: 0, max: 477, step: 1 },
				// depth: { value: 0.15, min: 0, max: 1, optional: true, disabled: true },
				// player: folder({
				// 	rotation: [0, 0, 0],
				// 	position: [-0, 0.2, 0],
				// }),
			})

			const userCamRef = useRef()
			useHelper(gui.camera !== 'user' && userCamRef, THREE.CameraHelper)

			const [userCam, setUserCam] = useState()

			const controls = useThree((state) => state.controls)
			const faceControlsApiRef = useRef()

			// const screenMatRef = useRef(null)
			const onVideoFrame = useCallback(
				(e) => {
					controls.detect(e.texture.source.data, e.time)

					// screenMatRef.current.map = e.texture
				},
				[controls]
			)

			const [current] = useState(() => new THREE.Object3D())
			useFrame((_, delta) => {
				if (faceControlsApiRef.current) {
					const target = faceControlsApiRef.current.computeTarget()

					// faceControlsApiRef.current.update(delta, target);
					// userCam.position.copy(target.position);
					// userCam.rotation.copy(target.rotation);
					const eps = 1e-9
					easing.damp3(current.position, target.position, gui.smoothTime, delta, undefined, undefined, eps)
					easing.dampE(current.rotation, target.rotation, gui.smoothTime, delta, undefined, undefined, eps)

					userCam.position.copy(current.position)
					userCam.rotation.copy(current.rotation)
				}
			})

		return (
			<>
				{/* <Lighting /> */}

				<PerspectiveCamera
					ref={(cam) => {
						userCamRef.current = cam
						setUserCam(cam)
					}}
					makeDefault={gui.camera === 'user'}
					fov={35}
					// position={[0, 0, -5]}
					// position={[-0.43142223655091505, -0.9836373086053689, -3.8445090520469414]}
				/>
				<OrbitControls 
				// autoRotate 
				// autoRotateSpeed={0.3}
				enableDamping target={[1.2, -0.5, -1.6]} />

				<FaceControls
					// offsetScalar={15}
					camera={userCam}
					ref={faceControlsApiRef}
					// autostart={gui.autostart}
					makeDefault
					// webcam={gui.webcam}
					// webcamVideoTextureSrc={gui.webcamVideoTextureSrc}
					manualUpdate
					manualDetect
					onVideoFrame={onVideoFrame}
					smoothTime={gui.smoothTime}
					offset={gui.offset}
					offsetScalar={gui.offsetScalar}
					eyes={gui.eyes}
					eyesAsOrigin={gui.eyesAsOrigin}
					depth={gui.depth}
					facemesh={{ origin: gui.origin, position: [0, 0, 0] }}
					debug={gui.camera !== 'user'}
				/>

				<Splat />
			</>
		)
}
