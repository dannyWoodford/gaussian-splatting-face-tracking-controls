import React, { useEffect } from 'react';
import { useCanvas } from '../../context/CanvasContext'

import Lighting from './setup/Lighting'
import Box from './objects/Box'

export default function Scene() {
	const { setCanvasLoaded } = useCanvas()

		// Initialize and Reset timeline
	useEffect(() => {
		setCanvasLoaded(true)
	}, [setCanvasLoaded])

	return (
		<>
			<Lighting />

			<Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
		</>
	);
}
