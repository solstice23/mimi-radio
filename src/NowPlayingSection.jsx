import { useEffect, useState, useReducer, useRef, useContext, useLayoutEffect } from 'react';
import Card from './components/Card.jsx';
import './NowPlayingSection.scss';
import { VideoPlayer } from './Player.jsx';
import { Controller } from './Controller.jsx';

import { QueueContext } from './contexts/QueueContext.jsx';


export function NowPlayingSection(props) {
	return (
		<div className="now-playing-section">
			<VideoPlayer/>
			<Lyrics/>
			<Controller/>
		</div>
	)
}


function Lyrics(props) {
	const queueManager = useContext(QueueContext);
	return (
		<Card className="lyrics" ripple={false} layer={false}>
		</Card>
	)
}

