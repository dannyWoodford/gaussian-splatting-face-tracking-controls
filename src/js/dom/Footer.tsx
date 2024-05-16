import { useCanvas } from '../../context/CanvasContext'
import AudioPlayer from '../3d/setup/AudioPlayer'

import { Logo } from './Logo'

export function Footer() {
	const {
		sceneCount,
		setSceneIndex,
		hideOverlay
	} = useCanvas()

	const goToNextScene = (sceneCount: number): void => {
		// @ts-ignore
		setSceneIndex((prevIndex: number) => (prevIndex === sceneCount - 1 ? 0 : prevIndex + 1));
	};

	const goToPreviousScene = (sceneCount: number): void => {
		// @ts-ignore
		setSceneIndex((prevIndex: number) => (prevIndex === 0 ? sceneCount - 1 : prevIndex - 1));
	};

	return (
		<div className={`pmndrs-menu ${hideOverlay ? '' : 'after'}`}>
			<div>
				<Logo style={{ width: 42, height: 42 }} color={hideOverlay ? '#b0b0b0' : '#303030'} />
			</div>
			<div>
				<span>
					<b><a href="https://dannywoodforddev.web.app/home">Danny Woodford</a></b>
				</span>
				<a href="https://www.linkedin.com/in/danny-woodford-54b418126/">LinkedIn</a>
				<a href="https://github.com/dannyWoodford">Github</a>
			</div>
			<div>
				<span><a href="https://github.com/dannyWoodford/gaussian-splatting-face-tracking-controls">View Code</a></span>
			</div>
			<div style={{ width: '100%' }} />
			<div>
				<div className={`carousel-buttons ${hideOverlay ? 'show' : ''}`}>
					<button className='arrow-button left' onClick={() => goToPreviousScene(sceneCount)}>
						&lt;
					</button>
					<button className='arrow-button right' onClick={() => goToNextScene(sceneCount)}>
						&gt;
					</button>
					<AudioPlayer />
				</div>
				{/* <b>{link1}</b>
				{link2} */}
			</div>
		</div>
	)
}