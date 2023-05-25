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
import { MdSkipPrevious, MdSkipNext, MdOutlineSkipPrevious, MdOutlineSkipNext, MdPause, MdPlayArrow } from 'react-icons/md';
import './NowPlayingSection.scss';
import YouTube from 'react-youtube';

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
								autoplay: 1,
								modestbranding: true,
								controls: 0,
							}
						}}
						iframeClassName="youtube-player-iframe"
						//style={object}
						//title={string}                    // defaults -> ''
						loading="eager"                  // defaults -> undefined
						//opts={obj}                        // defaults -> {}
						onReady={(e) => queueManager.iframeTarget.current = e.target}
						onPlay={(e) => {
							queueManager.iframeTarget.current = e.target;
							window.dispatchEvent(new Event('ytb-play'));
						}}
						onPause={(e) => queueManager.iframeTarget.current = e.target}
						onEnd={(e) => queueManager.iframeTarget.current = e.target}
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
							"show": queueManager.currentSong && videoID && (queueManager.playState === 'ended' || queueManager.playState === 'unstarted' || queueManager.playState === 'cued')
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


function Controller(props) {
	const queueManager = useContext(QueueContext);
	const isPaused = queueManager.playState === 'paused';
	return (
		<Card className="controller" ripple={false} layer={false}>
			<ControllerBg/>
			<div className="controller-inner">
				<div className="controller-top">
					<div className="song-info">
						<div className="song-name">
							{queueManager.currentSong?.name ?? " "}
						</div>
						<div className="song-creators">
							{
								[
									...(queueManager.currentSong?.artist?.split(',') ?? []),
									...(queueManager.currentSong?.singer?.split(',') ?? []),
								]?.map((x) => x.trim())?.join(', ')}
						</div>
						<Time/>
					</div>
					<FAB
						title={isPaused ? "Play" : "Pause"}
						color="primary"
						onClick={() => {
							if (isPaused) {
								queueManager.iframeTarget.current.playVideo();
							} else {
								queueManager.iframeTarget.current.pauseVideo();
							}
						}}
					>
						{ isPaused ? <MdPlayArrow/> : <MdPause/>}
					</FAB>
				</div>
				<div className="controller-bottom">
					<IconButton	title="Previous">
						<MdOutlineSkipPrevious/>
					</IconButton>
					<ProgressBar/>
					<IconButton	title="Next">
						<MdOutlineSkipNext/>
					</IconButton>
				</div>
			</div>
		</Card>
	)
}

function Time() {
	const queueManager = useContext(QueueContext);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(queueManager.iframeTarget.current?.getCurrentTime() ?? 0);
			setDuration(queueManager.iframeTarget.current?.getDuration() ?? 0);
		}, 100);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="song-time">
			{formatLength(currentTime)} / {formatLength(duration)}
		</div>
	)
}

function ProgressBar() {
	const queueManager = useContext(QueueContext);

	const [progress, setProgress] = useState(0);
	const hanging = useRef(false); // after seek, the progress bar will hang for a while

	useEffect(() => {
		const interval = setInterval(() => {
			if (!queueManager.iframeTarget.current) return;
			if (queueManager.playState === 'buffering') return;
			if (hanging.current) return;
			queueManager.currentTime.current = queueManager.iframeTarget.current.getCurrentTime();
			queueManager.duration.current = queueManager.iframeTarget.current.getDuration();
			setProgress(queueManager.currentTime.current / queueManager.duration.current * 100);
		}, 50);
		return () => clearInterval(interval);
	}, []);

	const onResume = () => {
		hanging.current = false;
	}
	useEffect(() => {
		window.addEventListener('ytb-play', onResume);
		return () => window.removeEventListener('ytb-play', onResume);
	}, []);



	return (
		<WaveProgressBar
			className="progress-bar"
			defaultProgress={50}
			progress={progress}
			paused={(queueManager.playState === 'paused' || queueManager.playState === 'ended' || queueManager.playState === 'unstarted' || queueManager.playState === 'cued')}
			onChange={(progress) => {
				hanging.current = true;
				setProgress(progress);
				queueManager.iframeTarget.current.seekTo(progress / 100 * queueManager.duration.current);
			}}
		/>
	);
}
import { sourceColorFromImage } from '@material/material-color-utilities'
function ControllerBg() {
	const controllerBgRef = useRef(null);

	const queueManager = useContext(QueueContext);

	const ThemeManager = useContext(ThemeColorSetContext);
	const calcThemeColor = async () => {
		if (!queueManager.currentSong?.cover) return;
		let dominantColor = queueManager.currentSong?.dominantColor;
		if (!dominantColor) {
			const img = new Image();
			img.src = new URL(`./data/covers/${queueManager.currentSong.cover}`, import.meta.url).href.replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
			dominantColor = await new Promise((resolve, reject) => {
				img.onload = () => {
					resolve(sourceColorFromImage(img));
				}
				img.onerror = () => {
					reject();
				}
			});
		}
		ThemeManager.setThemeColor(dominantColor);
	}


	useEffect(() => {
		calcThemeColor();
	}, [queueManager.currentSong]);

	return (
		<div
			className="controller-bg"
			ref={controllerBgRef}
			style={{
				backgroundImage: `url(${queueManager.currentSong?.cover ? new URL(`./data/covers/${queueManager.currentSong.cover}`, import.meta.url).href.replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') : null})`
			}}
		/>
	);
}