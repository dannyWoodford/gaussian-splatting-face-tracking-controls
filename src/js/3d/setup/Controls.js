import React, { useEffect, useRef, useState, useMemo } from 'react'
import { PerspectiveCamera, OrbitControls, FaceControls, useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useCanvas } from '../../../context/CanvasContext'

export default function Controls() {
	const { hideOverlay, sceneIndex, scrollNumber, setScrollNumber } = useCanvas()

	// ____ Debug FaceControls  _________________________________________________________________________________
	const gui = useControls({
		camera: { value: 'user', options: ['user', 'cc'] },
	})

	const userCamRef = useRef()
	useHelper(gui.camera !== 'user' && userCamRef, THREE.CameraHelper)

	// ____ FaceControls  _________________________________________________________________________________
	const [userCam, setUserCam] = useState()
	const smoothTimeValue = 0.55

	// ____ Simulate OrbitControl Zoom _________________________________________________________________________________
	// const [scrollNumber, setScrollNumber] = useState(7)

	useEffect(() => {
		if (!hideOverlay) return

		const handleWheel = (event) => {
			// Calculate the increment or decrement based on wheel direction
			const increment = event.deltaY > 0 ? -1 : 1

			// Define the sensitivity factor
			const sensitivityFactor = 0.4 // Adjust this value as needed

			// Calculate the new scroll number within the desired range
			const newScrollNumber = Math.min(Math.max(scrollNumber + increment * sensitivityFactor, 1.3), 35)

			// Update the state with the new scroll number
			setScrollNumber(newScrollNumber)

			// Prevent default behavior to avoid scrolling the page
			event.preventDefault()
		}

		// Add event listener for the wheel event
		window.addEventListener('wheel', handleWheel, { passive: false })

		// Clean up the event listener when component unmounts
		return () => {
			window.removeEventListener('wheel', handleWheel)
		}
	}, [scrollNumber, hideOverlay, setScrollNumber])

	// reset scrollNumber when sceneIndex changes
	useEffect(() => {
		if (sceneIndex === 0) {
			setScrollNumber(7)
		} else if (sceneIndex === 1) {
			setScrollNumber(8)
		} else if (sceneIndex === 2) {
			setScrollNumber(7)
		}
	}, [sceneIndex, setScrollNumber])

	const fovPerScene = useMemo(() => {
		if (sceneIndex === 0) {
			return 55
		} else if (sceneIndex === 1) {
			return 80
		} else if (sceneIndex === 2) {
			return 80
		}
	}, [sceneIndex])

	return (
		<group name='Controls'>
			<PerspectiveCamera
				ref={(cam) => {
					userCamRef.current = cam
					setUserCam(cam)
				}}
				makeDefault={gui.camera === 'user'}
				fov={fovPerScene}
				far={500}
			/>
			{gui.camera !== 'user' && <OrbitControls target={[1.2, -0.5, -1.6]} />}

			<FaceControls
				camera={userCam}
				smoothTime={smoothTimeValue}
				// eyes={true}
				offset={true}
				offsetScalar={scrollNumber}
				facemesh={{ origin: 0, position: [0, 2, 0] }}
				debug={gui.camera !== 'user'}
			/>
		</group>
	)
}
