import React, { useEffect, useRef, useState } from 'react'
import { PerspectiveCamera, OrbitControls, FaceControls, useHelper } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useCanvas } from '../../../context/CanvasContext'

export default function TestControls() {

	return (
		<group name='Controls'>
			<PerspectiveCamera 
				fov={85} 
				near={0.01}
				far={1000}
				position={[4.5, 4, 11]} 
			/>

			<OrbitControls />

			<group name='Background'>
				<directionalLight color='white' position={[0, 20, 10]} />
				<directionalLight color='white' position={[0, 20, -10]} />

				<ambientLight intensity={100} />
			</group>
		</group>
	)
}
