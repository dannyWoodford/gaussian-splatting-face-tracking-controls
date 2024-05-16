import React, { useEffect, useState } from 'react';
import { useCanvas } from '../../../context/CanvasContext'

const AudioPlayer = () => {
	const { hideOverlay } = useCanvas()

	const audioFile = process.env.PUBLIC_URL + '/Ambient-music.mp3'

	const [audio] = useState(new Audio(audioFile));
	const [muted, setMuted] = useState(true);

	useEffect(() => {
		if (hideOverlay) {
			audio.play();
			setMuted(false);
		}
	}, [audio, hideOverlay])
	

	const toggleMute = () => {
		if (muted) {
			audio.play();
		} else {
			audio.pause();
		}
		setMuted(!muted);
	};

	return (
		<div className="audio-button">
			<div className={`speaker ${muted ? 'on' : ''}`} onClick={toggleMute}>
				<div id="mute" className="mute"></div>
				<span></span>
			</div>
		</div>
	);
};

export default AudioPlayer;