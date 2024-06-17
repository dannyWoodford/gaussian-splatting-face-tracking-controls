import React, { useEffect, useMemo } from 'react'
import { useCanvas } from '../../context/CanvasContext'

import TestControls from './setup/TestControls'
import Controls from './setup/Controls'
import Background from './setup/Background'

import Splat1Wind from './objects/Splat1Wind'
// import Splat from './objects/Splat'
import Model from './objects/Model'
import Particles from './objects/Particles'
import ParticlesPlain from './objects/ParticlesPlain'
import ParticlesPlainV2 from './objects/ParticlesPlainV2'
import Splat2 from './objects/Splat2'
import Splat3 from './objects/Splat3'

import GPGPU from './objects/testGPGPU/GPGPU'



export default function Scene(): JSX.Element {
	const { setCanvasLoaded, sceneIndex, hideOverlay } = useCanvas()

	// ____ Used for Loading Screen  _________________________________________________________________________________
	useEffect(() => {
		setCanvasLoaded(true)
	}, [setCanvasLoaded])

	// ____ Render Splat depending on sceneIndex _________________________________________________________________________________
	const sceneToRender = useMemo(() => {
		if (sceneIndex === 1) {
			return <Splat2 />
		} else if (sceneIndex === 2) {
			return <Splat3 />
		} else {
			return <Splat1Wind />
			// return <Splat />
		}
	}, [sceneIndex])

	return (
		<>
			<TestControls />
			{/* <Controls /> */}

			{/* {hideOverlay && sceneToRender} */}
			{/* <Model /> */}
			{/* <Particles /> */}
			{/* <ParticlesPlain /> */}
			<ParticlesPlainV2 />
			{/* <GPGPU /> */}

			{/* <Background /> */}
		</>
	)
}
