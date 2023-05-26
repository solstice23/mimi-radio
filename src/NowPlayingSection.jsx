import { useEffect, useState, useReducer, useRef, useContext, useLayoutEffect } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit'
import { getSongsData, formatLength, formatDate } from './utils.js'
import Icon from './components/Icon.jsx'
import SegmentedButtons from './components/SegmentedButtons.jsx'
import Card from './components/Card.jsx';
import Tag from './components/Tag.jsx';
import IconButton from './components/IconButton.jsx';
import FAB from './components/FAB.jsx';
import Menu from './components/Menu.jsx';
import MenuItem, {MenuDivider} from './components/MenuItem.jsx';
import Checkbox from './components/Checkbox.jsx';
import WaveProgressBar from './components/WaveProgressBar.jsx';
import { MdSkipPrevious, MdSkipNext, MdOutlineSkipPrevious, MdOutlineSkipNext, MdPause, MdPlayArrow, MdShuffle, MdRepeat, MdRepeatOne, MdQueueMusic, MdPlaylistRemove, MdClearAll } from 'react-icons/md';
import './NowPlayingSection.scss';
import YouTube from 'react-youtube';
import { Controller } from './Controller.jsx';

import { QueueContext } from './contexts/QueueContext.jsx';
import { ThemeColorSetContext } from './contexts/ThemeColorSetContext.jsx'
import classNames from 'classnames';


export function NowPlayingSection(props) {
	return (
		<div className="now-playing-section">
			<VideoPlayer/>
			<Lyrics/>
			<Controller/>
		</div>
	)
}

function VideoPlayer() {
	const queueManager = useContext(QueueContext);

	const videoID = queueManager.currentSong && queueManager.currentSong.link.split('v=')[1];

	const cover = queueManager.currentSong?.cover ? new URL(`./data/covers/${queueManager.currentSong.cover}`, import.meta.url).href.replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') : null;

	return (
		<Card className="youtube-player-container" ripple={false} layer={false}>
			{
				queueManager.currentSong && videoID && (
					<YouTube
						videoId={videoID}
						//id={string}
						className="youtube-player"
						opts={{
							playerVars: {
								// https://developers.google.com/youtube/player_parameters
								autoplay: queueManager.autoPlay ? 1 : 0,
								modestbranding: true,
								controls: 0,
							}
						}}
						iframeClassName="youtube-player-iframe"
						//style={object}
						//title={string}                    // defaults -> ''
						loading="eager"                  // defaults -> undefined
						//opts={obj}                        // defaults -> {}
						onReady={(e) => {
							queueManager.iframeTarget.current = e.target;
							if (!queueManager.autoPlay) {
								queueManager.setPlayState('unstarted');
							}
						}}
						onPlay={(e) => {
							queueManager.iframeTarget.current = e.target;
							window.dispatchEvent(new Event('ytb-play'));
						}}
						onPause={(e) => queueManager.iframeTarget.current = e.target}
						onEnd={(e) => {
							queueManager.iframeTarget.current = e.target;
							window.dispatchEvent(new Event('ytb-end'));
							queueManager.onSongEnd();
						}}
						onError={(e) => queueManager.iframeTarget.current = e.target}
						onStateChange={(e) => {
							console.log(e);
							window.ifr = e.target;
							queueManager.iframeTarget.current = e.target;
							queueManager.setPlayState(['unstarted', 'ended', 'playing', 'paused', 'buffering', 'cued'][e.data + 1]);
						}}
						/*onPlaybackRateChange={func}       // defaults -> noop
						onPlaybackQualityChange={func}    // defaults -> noop*/
					/>
				)
			}
			<div 
				className={
					classNames(
						"youtube-player-text",
						{
							"show": !queueManager.currentSong
						}
					)
				}>
				No song is playing
			</div>
			<div
				className={
					classNames(
						"youtube-player-overlay",
						{
							"show": queueManager.currentSong && videoID && (queueManager.playState === 'ended' || queueManager.playState === 'unstarted' || queueManager.playState === 'cued'),
							"loading": queueManager.currentSong && videoID && queueManager.playState === 'cued',
							"ended": queueManager.currentSong && videoID && queueManager.playState === 'ended'
						}
					)
				}
				style={{
					backgroundImage: `url(${cover})`
				}}
			/>
		</Card>
	)
}

function Lyrics(props) {
	const queueManager = useContext(QueueContext);
	return (
		<Card className="lyrics" ripple={false} layer={false}>
		</Card>
	)
}

