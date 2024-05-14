import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, FaceLandmarker } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useCanvas } from '../context/CanvasContext'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Leva } from 'leva'
import { useControls } from 'leva'

import Scene from './3d/Scene'

export default function CanvasContainer() {
	const {
		isDev,
		canvasLoaded,
		sceneIndex,
		setSceneIndex
	} = useCanvas()

	const goToNextScene = () => {
		setSceneIndex((prevIndex) => (prevIndex === sceneIndex - 1 ? 0 : prevIndex + 1))
	}

	const goToPreviousScene = () => {
		setSceneIndex((prevIndex) => (prevIndex === 0 ? sceneIndex - 1 : prevIndex - 1))
	}

	const { bloomEnabled, vignetteEnabled } = useControls({
    bloomEnabled: true,
    vignetteEnabled: true
  });

	return (
		<div className='canvas-container'>
			{/* <div className={` ${canvasLoaded ? 'loaded' : ''}`}>
				<div id='loader-wrapper'>
					<div id='loader'></div>
					<div className='loader-section section-left'></div>
					<div className='loader-section section-right'></div>
				</div>
			</div> */}

			<div className={`carousel-buttons ${canvasLoaded ? 'show' : ''}`}>
				<button className="arrow-button left" onClick={goToPreviousScene}>
					&lt;
				</button>
				<button className="arrow-button right" onClick={goToNextScene}>
					&gt;
				</button>
			</div>

			<Leva hidden={!isDev} />

			<Canvas>
				<FaceLandmarker>
					<Scene sceneIndex={sceneIndex} />
				</FaceLandmarker>

				{isDev && <Perf position='bottom-left' style={{ zIndex: 0 }} showGraph={false} deepAnalyze={true} />}
				<AdaptiveDpr pixelated />

				<EffectComposer>
					{bloomEnabled && <Bloom luminanceThreshold={0} luminanceSmoothing={1.9} />}
          {vignetteEnabled && <Vignette eskil={false} offset={0.1} darkness={0.96} />}
				</EffectComposer>
			</Canvas>
		</div>
	)
}
