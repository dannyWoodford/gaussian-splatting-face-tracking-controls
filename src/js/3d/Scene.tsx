import React, { useEffect, useMemo } from 'react'
import { useCanvas } from '../../context/CanvasContext'

import Controls from './setup/Controls'
import Background from './setup/Background'

import Splat from './objects/Splat'
import Splat2 from './objects/Splat2'
import Splat3 from './objects/Splat3'


export default function Scene(): JSX.Element {
	const { setCanvasLoaded, sceneIndex } = useCanvas()

	// ____ Used for Loading Screen  _________________________________________________________________________________
	useEffect(() => {
		setCanvasLoaded(true)
	}, [setCanvasLoaded])

	// ____ Render Splat depending on sceneIndex _________________________________________________________________________________
	const sceneToRender = useMemo(() => {
		console.log('%csceneIndex', 'color:red;font-size:14px;', sceneIndex );
		
		if (sceneIndex === 1) {
			return <Splat2 />
		} else if (sceneIndex === 2) {
			return <Splat3 />
		} else {
			return <Splat />
		}
	}, [sceneIndex])

	return (
		<>
			<Controls />

			{sceneToRender}

			<Background />
		</>
	)
}
