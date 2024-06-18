import { useCanvas } from '../../context/CanvasContext'
import AudioPlayer from '../3d/setup/AudioPlayer'

import { OctoLogo } from './Logo'

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
			<div className="pmndrs-menu-links">
				<div>
					<a target='_blank' rel='noopener noreferrer' href='https://dannywoodforddev.web.app/home'>
						<OctoLogo 
						color={hideOverlay ? '#b0b0b0' : '#303030'} />
					</a>
				</div>
				<div>
					<span className="my-name" >
						<b><a target="_blank" rel="noopener noreferrer" href="https://dannywoodforddev.web.app/home">Danny Woodford</a></b>
					</span>
					<a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/danny-woodford-54b418126/">LinkedIn</a>
					<a target="_blank" rel="noopener noreferrer" href="https://github.com/dannyWoodford">Github</a>
					<a className="link-mobile" target="_blank" rel="noopener noreferrer" href="https://github.com/dannyWoodford/gaussian-splatting-face-tracking-controls">View Code</a>
				</div>
				<div>
					<a className="link-desktop" target="_blank" rel="noopener noreferrer" href="https://github.com/dannyWoodford/gaussian-splatting-face-tracking-controls">View Code</a>
				</div>
			</div>
			<div style={{ width: '100%' }} />
			<div className={`carousel-buttons ${hideOverlay ? 'show' : ''}`}>
				<button className='arrow-button left' onClick={() => goToPreviousScene(sceneCount)}>
					&lt;
				</button>
				<button className='arrow-button right' onClick={() => goToNextScene(sceneCount)}>
					&gt;
				</button>
				<AudioPlayer />
			</div>
		</div>
	)
}