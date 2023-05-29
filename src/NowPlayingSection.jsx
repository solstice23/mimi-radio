import './NowPlayingSection.scss';
import { VideoPlayer } from './Player.jsx';
import { Lyrics } from './Lyrics.jsx';
import { Controller } from './Controller.jsx';

import { MdKeyboardArrowUp } from 'react-icons/md';
import { useRipple } from './components/Ripple';

import { QueueContext } from './contexts/QueueContext.jsx';
import classNames from 'classnames';
import { useContext } from 'react';

export function NowPlayingSection() {
	const queueManager = useContext(QueueContext);

	return (
		<div className={
			classNames(
				"now-playing-section",
				{
					"not-playing": !queueManager.currentSong,
				}
			)
		}>
			<VideoPlayer/>
			<Lyrics/>
			<Controller/>
			<ExpandButton/>
		</div>
	)
}


function ExpandButton() {
	const ref = useRipple();

	return (
		<div
			className="expand-button"
			ref={ref}
			onClick={() => {
				document.body.classList.toggle('now-playing-expanded');
			}}
		>
			<MdKeyboardArrowUp/>
		</div>
	);
}


