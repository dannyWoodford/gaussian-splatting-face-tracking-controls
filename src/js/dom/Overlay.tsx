import { useCanvas } from '../../context/CanvasContext'

export default function Overlay() {
	const { canvasLoaded, hideOverlay, setHideOverlay } = useCanvas()

	return (
		<div className={`fullscreen bg ${canvasLoaded ? 'loaded' : 'notready'} ${hideOverlay ? 'clicked' : ''}`}>
			<div onClick={() => setHideOverlay(true) }>
				{!canvasLoaded ? (
					'loading...'
				) : (
					<>
						<b>
							<span style={{ color: 'black' }}>Enter</span>
						</b>
					</>
				)}
			</div>
		</div>
	);
}
