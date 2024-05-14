import React, { useEffect, useRef, useState } from 'react'
import { PerspectiveCamera, OrbitControls, FaceControls, useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

export default function Controls() {
	
	// ____ Debug FaceControls  _________________________________________________________________________________
	const gui = useControls({
		camera: { value: 'user', options: ['user', 'cc'] },
	})

	const userCamRef = useRef()
	useHelper(gui.camera !== 'user' && userCamRef, THREE.CameraHelper)

	// ____ FaceControls  _________________________________________________________________________________
	const [userCam, setUserCam] = useState()
	const smoothTimeValue = 0.85

	// ____ Simulate OrbitControl Zoom _________________________________________________________________________________
	const [scrollNumber, setScrollNumber] = useState(7)

	useEffect(() => {
		const handleWheel = (event) => {
			// Calculate the increment or decrement based on wheel direction
			const increment = event.deltaY > 0 ? -1 : 1

			// Define the sensitivity factor
			const sensitivityFactor = 0.4 // Adjust this value as needed

			// Calculate the new scroll number within the desired range
			const newScrollNumber = Math.min(Math.max(scrollNumber + increment * sensitivityFactor, 2), 35)

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
	}, [scrollNumber]) // Include scrollNumber in the dependency array

	return (
		<group name="Controls">
			<PerspectiveCamera
				ref={(cam) => {
					userCamRef.current = cam
					setUserCam(cam)
				}}
				makeDefault={gui.camera === 'user'}
				fov={55}
				far={500}
			/>
			{/* {gui.camera !== 'user' && <OrbitControls enableDamping target={[1.2, -0.5, -1.6]} />} */}
			<OrbitControls enableDamping target={[1.2, -0.5, -1.6]} />

			<FaceControls
				camera={userCam}
				smoothTime={smoothTimeValue}
				offset={true}
				offsetScalar={scrollNumber}
				facemesh={{ origin: 0, position: [0, 2, 0] }}
				debug={gui.camera !== 'user'}
			/>
		</group>
	);
}
