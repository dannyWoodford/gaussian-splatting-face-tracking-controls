import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, FaceLandmarker } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useCanvas } from '../context/CanvasContext'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'


import Scene from './3d/Scene'

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
			>
				<FaceLandmarker>
					<Scene />
				</FaceLandmarker>

				{isDev && <Perf position='bottom-left' style={{ zIndex: 0 }} showGraph={false} deepAnalyze={true} />}
				<AdaptiveDpr pixelated />

				<EffectComposer>
					<Bloom
						luminanceThreshold={0} luminanceSmoothing={1.9}
					/>
					<Vignette
						eskil={false} offset={0.1} darkness={0.96}
					/>
				</EffectComposer>
			</Canvas>
		</div>
	)
}
