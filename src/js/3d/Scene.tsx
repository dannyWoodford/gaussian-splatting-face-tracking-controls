import React, { useEffect, useMemo } from 'react'
import { useCanvas } from '../../context/CanvasContext'

import Controls from './setup/Controls'
import Background from './setup/Background'

import Splat from './objects/Splat'
import Splat2 from './objects/Splat2'
import Splat3 from './objects/Splat3'

interface SceneProps {
	sceneIndex: number;
}

export default function Scene({ sceneIndex }: SceneProps): JSX.Element {
	const { setCanvasLoaded } = useCanvas()

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
