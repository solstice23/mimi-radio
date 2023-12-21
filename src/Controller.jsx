import { useEffect, useState, useRef, useContext, useLayoutEffect } from 'react';
import { formatLength } from './utils.js'
import Card from './components/Card.jsx';
import IconButton from './components/IconButton.jsx';
import FAB from './components/FAB.jsx';
import Menu from './components/Menu.jsx';
import WaveProgressBar from './components/WaveProgressBar.jsx';
import { MdSkipPrevious, MdSkipNext, MdOutlineSkipPrevious, MdOutlineSkipNext, MdPause, MdPlayArrow, MdShuffle, MdRepeat, MdRepeatOne, MdQueueMusic, MdPlaylistRemove, MdClearAll, MdAlbum } from 'react-icons/md';

import { QueueContext } from './contexts/QueueContext.jsx';
import { ThemeColorSetContext } from './contexts/ThemeColorSetContext.jsx'
import classNames from 'classnames';


export function Controller(props) {
	const queueManager = useContext(QueueContext);
	const isPaused = queueManager.playState === 'paused' || queueManager.playState === 'ended' || queueManager.playState === 'unstarted' || queueManager.playState === 'cued';

	const playPauseButtonRef = useRef(null);
	const onSpaceDown = (e) => {
		if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
		if (e.target.getAttribute("contenteditable") !== null) return;
		if (e.target.classList.contains("play-pause-button")) return;
		if (e.repeat) return;
		if (e.code === 'Space') {
			playPauseButtonRef.current?.click();
		}
	}
	useEffect(() => {
		window.addEventListener('keydown', onSpaceDown);
		return () => {
			window.removeEventListener('keydown', onSpaceDown);
		}
	}, []);

	useEffect(() => {
		if (isPaused) {
			document.title = "MIMI Radio";
		} else {
			document.title = `MIMI Radio | ${queueManager.currentSong?.name ?? "MIMI Radio"} - ${queueManager.currentSong?.artist}`;
		}
	}, [queueManager.currentSong, isPaused]);

	return (
		<Card className="controller" ripple={false} layer={false}>
			<ControllerBg/>
			<div className="controller-inner">
				<div className="song-badges">
					<div className="song-badge">
						{ queueManager.currentSong?.type.replace(/^\w/, c => c.toUpperCase()) ?? " " }
					</div>
					{
						queueManager.currentSong?.album && (
							<div className="song-badge">
								<MdAlbum/>
								{ queueManager.currentSong?.album ?? " " }
							</div>
						)
					}
				</div>
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
								]?.map((x) => x.trim())?.join(', ')
							}
						</div>
						<Time/>
					</div>
					{
						queueManager.currentSong &&
						<FAB
							ref={playPauseButtonRef}
							className="play-pause-button"
							title={isPaused ? "Play" : "Pause"}
							color="primary"
							onClick={() => {
								if (isPaused) {
									queueManager.play();
								} else {
									queueManager.pause();
								}
							}}
						>
							{ isPaused ? <MdPlayArrow/> : <MdPause/>}
						</FAB>
					}
				</div>
				<div className="controller-bottom">
					<IconButton	title="Previous" onClick={() => queueManager.prevSong()}>
						<MdOutlineSkipPrevious/>
					</IconButton>
					<ProgressBar/>
					<IconButton	title="Next" onClick={() => queueManager.nextSong()}>
						<MdOutlineSkipNext/>
					</IconButton>
					<IconButton
						title={queueManager.playMode.replace(/^\w/, c => c.toUpperCase())}
						onClick={() => {
							queueManager.setPlayMode(['repeat', 'loop', 'shuffle'][(['repeat', 'loop', 'shuffle'].indexOf(queueManager.playMode) + 1) % 3]);
						}}
					>
						{
							queueManager.playMode === 'loop' && <MdRepeatOne/>
						}
						{
							queueManager.playMode === 'repeat' && <MdRepeat/>
						}
						{
							queueManager.playMode === 'shuffle' && <MdShuffle/>
						}
					</IconButton>
					<QueuePanel/>
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
			{formatLength(queueManager.currentSong ? currentTime : 0)} / {formatLength(queueManager.currentSong ? duration : 0)}
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
		}, 20);
		return () => clearInterval(interval);
	}, []);

	const onResume = () => {
		hanging.current = false;
	}
	useEffect(() => {
		window.addEventListener('video-play', onResume);
		return () => window.removeEventListener('video-play', onResume);
	}, []);



	return (
		<WaveProgressBar
			className="progress-bar"
			defaultProgress={50}
			progress={queueManager.currentSong ? progress : 0}
			paused={(queueManager.playState === 'paused' || queueManager.playState === 'ended' || queueManager.playState === 'unstarted' || queueManager.playState === 'cued')}
			disabled={!queueManager.currentSong}
			onChange={(progress) => {
				hanging.current = true;
				setProgress(progress);
				queueManager.iframeTarget.current.seekTo(progress / 100 * queueManager.duration.current);
			}}
		/>
	);
}
import { sourceColorFromImage } from '@material/material-color-utilities'
import { useRipple } from './components/Ripple.jsx';
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
function QueuePanel() {
	const queueManager = useContext(QueueContext);
	const [open, setOpen] = useState(false);
	const openBtnRef = useRef(null);
	const menuRef = useRef(null);
	const menuContentRef = useRef(null);

	useLayoutEffect(() => {
		if (!open) return;
		const playingSong = menuContentRef.current.querySelector('.queue-menu-item.playing');
		if (!playingSong) return;
		playingSong.scrollIntoView({
			behavior: 'instant',
			block: 'center',
		});
	}, [open]);

	
	const handleClickAway = (e) => {
		if (open && !menuRef.current.contains(e.target) && !openBtnRef.current.contains(e.target)) {
			setOpen(false);
		}
	}
	useEffect(() => {
		document.addEventListener('click', handleClickAway);
		return () => {
			document.removeEventListener('click', handleClickAway);
		}
	}, [open]);

	return (
		<IconButton
			title="Queue"
			onClick={(e) => {
				setOpen(!open);
			}}
			ref={openBtnRef}
		>
			<MdQueueMusic/>
			<Menu
				ref={menuRef}
				className="queue-menu"
				anchorElement={openBtnRef?.current}
				anchorPosition="right bottom"
				fixed={true}
				open={open}
			>
				<div className="queue-menu-header">
					<div className="queue-menu-title">
						Queue
						<span className="queue-menu-title-count">
							{queueManager.queue.length}
						</span>
					</div>
					{
						queueManager.queue.length > 0 && (	
							<IconButton	title="Clear Queue" onClick={() => {queueManager.clearQueue(); setOpen(false);}}>
								<MdClearAll/>
							</IconButton>
						)
					}
				</div>
				<div className="queue-menu-content" ref={menuContentRef}>
					{
						queueManager.queue.map((song, index) => (
							<QueueSong
								song={song}
								index={index}
								playing={queueManager.currentSong?.hash === song.hash}
								key={song.hash}
							/>
						))
					}
					{
						queueManager.queue.length === 0 && (
							<div className="queue-menu-empty">
								Queue is empty
							</div>
						)
					}
				</div>
			</Menu>
		</IconButton>
	)
}
function QueueSong(props) {
	const ref = useRipple();
	const queueManager = useContext(QueueContext);
	const song = props.song;
	const index = props.index;
	const isPaused = queueManager.playState === 'paused' || queueManager.playState === 'ended' || queueManager.playState === 'unstarted' || queueManager.playState === 'cued';
	return (
		<div
			className={
				classNames(
					'queue-menu-item',
					{
						'playing': props.playing,
					}
				)
			}
			ref={ref}
			key={song.hash}
			onDoubleClick={() => {
				queueManager.playSongByIndex(index);
			}}
		>
			<div className="queue-menu-item-cover">
				<div className="queue-menu-item-cover-bg" style={{
					backgroundImage: `url(${song.cover ? new URL(`./data/covers/${song.cover}`, import.meta.url).href.replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') : null})`
				}}/>
			</div>
			<div className="queue-menu-item-info">
				<div className="queue-menu-item-name">
					{song.name}
				</div>
				<div className="queue-menu-item-creators">
					{
						[
							...(song.artist?.split(',') ?? []),
							...(song.singer?.split(',') ?? []),
						]?.map((x) => x.trim())?.join(', ')
					}
				</div>
			</div>
			<div className="queue-menu-item-actions">
				<div className="queue-menu-item-actions-inner">
					<IconButton
						className="queue-menu-item-action"
						title="Remove"
						onClick={(e) => {
							e.stopPropagation();
							queueManager.removeSongByIndex(index);
						}}
					>
						<MdPlaylistRemove/>
					</IconButton>
					{
						queueManager.currentSong?.hash !== song.hash ? (
							<IconButton
								className="queue-menu-item-action"
								title="Play"
								onClick={(e) => {
									e.stopPropagation();
									queueManager.playSongByIndex(index);
								}}
							>
								<MdPlayArrow/>
							</IconButton>
						) : (
							<IconButton
								className="queue-menu-item-action"
								title={isPaused ? "Play" : "Pause"}
								onClick={(e) => {
									e.stopPropagation();
									if (isPaused) {
										queueManager.play();
									} else {
										queueManager.pause();
									}
								}}
							>
								{ isPaused ? <MdPlayArrow/> : <MdPause/>}
							</IconButton>
						)
					}
				</div>
			</div>
		</div>
	)
}