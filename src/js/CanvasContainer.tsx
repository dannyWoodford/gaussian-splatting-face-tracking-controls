import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useCanvas } from '../context/CanvasContext'

import Scene from './3d/Scene'
import Loading from './3d/setup/Loading'

export default function CanvasContainer() {
	const { isDev, canvasLoaded } = useCanvas()

	return (
		<div className='canvas-container'>
			<div className={` ${canvasLoaded ? 'loaded' : ''}`}>
				<div id='loader-wrapper'>
					<div id='loader'></div>
					<div className='loader-section section-left'></div>
					<div className='loader-section section-right'></div>
				</div>
			</div>

			<Canvas 
			// shadows 
			// gl={{antialias: false,}}
			>
				<Suspense fallback={<Loading />}>
					<Scene />
				</Suspense>

				{isDev && <Perf position='bottom-left' style={{ zIndex: 0 }} showGraph={false} deepAnalyze={true} />}

				<AdaptiveDpr pixelated />
			</Canvas>
		</div>
	)
}
