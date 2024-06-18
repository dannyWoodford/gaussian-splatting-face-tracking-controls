import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, FaceLandmarker } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useCanvas } from '../context/CanvasContext'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Leva } from 'leva'
import { useControls } from 'leva'

import Scene from './3d/Scene'
import { Footer } from './dom/Footer'
import Overlay from './dom/Overlay'

export default function CanvasContainer() {
	const { isDev, hideOverlay } = useCanvas()

	const { effects } = useControls({
		effects: {
			label: 'Effects',
			value: true,
		},
	})
	const { showStats } = useControls({
		showStats: {
			label: 'Show Stats',
			value: false,
		},
	})

	// const { bloomEnabled, vignetteEnabled } = useControls({
	// 	bloomEnabled: true,
	// 	vignetteEnabled: true,
	// })

	return (
		<div className='canvas-container'>
			{/* <Leva hidden={!isDev} /> */}
			<Leva collapsed hidden={!hideOverlay} />

			<Canvas>
				<FaceLandmarker>
					<Scene />
				</FaceLandmarker>

				{/* <Perf position='top-left' style={{ zIndex: 0 }} showGraph={false} deepAnalyze={true} /> */}
				{/* {isDev && <Perf position='top-left' style={{ zIndex: 0 }} showGraph={false} deepAnalyze={true} />} */}
				{showStats && <Perf position='top-left' style={{ zIndex: 0 }} showGraph={false} deepAnalyze={true} />}
				<AdaptiveDpr pixelated />

				<EffectComposer>
					{/* {bloomEnabled && <Bloom luminanceThreshold={0} luminanceSmoothing={1.9} />}
					{vignetteEnabled && <Vignette eskil={false} offset={0.1} darkness={0.96} />} */}
					{effects && (
						<>
							<Bloom luminanceThreshold={0} luminanceSmoothing={1.9} />
							<Vignette eskil={false} offset={0.1} darkness={0.96} />
						</>
					)}
				</EffectComposer>
			</Canvas>

			<Overlay />
			<Footer />
		</div>
	)
}
