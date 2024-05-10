import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, FaceLandmarker } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useCanvas } from '../context/CanvasContext'
import { EffectComposer, Autofocus, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing'
import { useControls, folder } from 'leva'


import Scene from './3d/Scene'
import Loading from './3d/setup/Loading'

export default function CanvasContainer() {
	const { isDev, canvasLoaded } = useCanvas()

	// const { ...autofocusConfig } = useControls({
	// 	target: { value: [1.2, -0.5, -1.6], optional: true, disabled: false },
	// 	mouse: false,
	// 	debug: { value: 0.02, min: 0, max: 0.15, optional: true },
	// 	// smoothTime: { value: 0.5, min: 0, max: 1 },
	// 	DepthOfField: folder(
	// 		// https://pmndrs.github.io/postprocessing/public/docs/class/src/effects/DepthOfFieldEffect.js~DepthOfFieldEffect.html#instance-constructor-constructor
	// 		{
	// 			// focusRange: { min: 0, max: 1, value: 0.001 },
	// 			// bokehScale: { min: bokehScaleMinMax[0], max: bokehScaleMinMax[1], value: 8 },
	// 			focusDistance: {
	// 				min: 0,
	// 				max: 40,
	// 				value: 0.8
	// 			},
	// 			focalLength: {
	// 				min: 0,
	// 				max: 10,
	// 				value: 7.2
	// 			},
	// 			bokehScale: {
	// 				min: 0,
	// 				max: 100,
	// 				value: 3
	// 			}
	// 		},
	// 		{ collapsed: true }
	// 	)
	// })

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
				<FaceLandmarker>

				{/* <Suspense fallback={<Loading />}>
				</Suspense> */}
					<Scene />

				{isDev && <Perf position='bottom-left' style={{ zIndex: 0 }} showGraph={false} deepAnalyze={true} />}

				<AdaptiveDpr pixelated />

				{/* <OrbitControls enableDamping target={autofocusConfig.target} /> */}

				<EffectComposer>

					<Bloom 
						luminanceThreshold={0} luminanceSmoothing={1.9}  
					
						// luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
						// luminanceSmoothing={0.025}
					/>
					<Vignette eskil={false} offset={0.1} darkness={0.96} />
				</EffectComposer>

				</FaceLandmarker>
			</Canvas>
		</div>
	)
}
