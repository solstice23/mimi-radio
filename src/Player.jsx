import { useEffect, useState, useReducer, useRef, useContext, useLayoutEffect } from 'react';
import Card from './components/Card.jsx';
import IconButton from './components/IconButton.jsx';
import { MdOpenInFull, MdCloseFullscreen } from 'react-icons/md';
import YouTube from 'react-youtube';

import { QueueContext } from './contexts/QueueContext.jsx';
import classNames from 'classnames';

const enableMirror = false;

export function VideoPlayer() {
	const queueManager = useContext(QueueContext);

	let videoType = 'none';
	if (queueManager?.currentSong?.youtubeID) {
		videoType = 'youtube';
	} else if (queueManager?.currentSong?.videoURL) {
		videoType = 'url';
	}

	const cover = queueManager.currentSong?.cover ? new URL(`./data/covers/${queueManager.currentSong.cover}`, import.meta.url).href.replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29') : null;

	return (
		<Card className="video-player-container" ripple={false} layer={false}>
			{
				videoType === 'youtube' && (!queueManager.currentSong.mirrored || !enableMirror )&&
				<YoutubePlayer/>
			}
			{
				videoType === 'youtube' && queueManager.currentSong.mirrored && enableMirror &&
				<URLPlayer/>
			}
			{
				videoType === 'url' &&
				<URLPlayer/>
			}
			<div 
				className={
					classNames(
						"video-player-text",
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
						"video-player-overlay",
						{
							"show": videoType !== 'none' && (queueManager.playState === 'ended' || queueManager.playState === 'unstarted' || queueManager.playState === 'cued'),
							"loading": videoType !== 'none' && queueManager.playState === 'cued',
							"ended": videoType !== 'none' && queueManager.playState === 'ended'
						}
					)
				}
				style={{
					backgroundImage: `url(${cover})`
				}}
			/>
			<IconButton
				className="player-control-btn video-player-fullscreen"
				onClick={() => {
					document.body.setAttribute("now-view-transition", "video");
					if (document.startViewTransition) {
						document.startViewTransition(() => {
							document.body.classList.add('video-exclusive');
						});
					} else {
						document.body.classList.add('video-exclusive');
					}
				}}
			>
				<MdOpenInFull/>
			</IconButton>
			<IconButton
				className="player-control-btn video-player-exit-fullscreen"
				onClick={() => {
					document.body.setAttribute("now-view-transition", "video");
					if (document.startViewTransition) {
						document.startViewTransition(() => {
							document.body.classList.remove('video-exclusive');
						});
					} else {
						document.body.classList.remove('video-exclusive');
					}
				}}
			>
				<MdCloseFullscreen/>
			</IconButton>
		</Card>
	)
}

function YoutubePlayer() {
	const queueManager = useContext(QueueContext);
	return (
		(
			<YouTube
				videoId={queueManager.currentSong.youtubeID}
				//id={string}
				className="youtube-player"
				opts={{
					playerVars: {
						// https://developers.google.com/youtube/player_parameters
						autoplay: queueManager.autoPlay ? 1 : 0,
						modestbranding: true,
						controls: 0,
						playsinline: 1,
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
					window.dispatchEvent(new Event('video-play'));
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
	)
}

function URLPlayer() {
	const queueManager = useContext(QueueContext);
	const playerRef = useRef(null);

	const controlProxyRef = useRef(null);

	useEffect(() => {
		// controlProxyRef.current.getter -> playerRef.current itself
		// controlProxyRef.current.getCurrentTime() -> playerRef.current.currentTime
		// controlProxyRef.current.play() -> playerRef.current.play()

		controlProxyRef.current = new Proxy(playerRef.current, {
			get: function(target, prop, receiver) {
				if (prop === 'getCurrentTime') {
					return () => target.currentTime;
				} else if (prop === 'getDuration') {
					return () => target.duration;
				} else if (prop === 'getVolume') {
					return () => target.volume;
				} else if (prop === 'playVideo') {
					return () => target.play();
				} else if (prop === 'pauseVideo') {
					return () => target.pause();
				} else if (prop === 'seekTo') {
					return (time) => target.currentTime = time;
				} else if (prop in target) {
					return target[prop];
				}
				return undefined;
			},
			set: function(target, prop, value, receiver) {
				if (prop in target) {
					target[prop] = value;
				}
				return true;
			}
		});
	}, []);

	useEffect(() => {
		queueManager.iframeTarget.current = controlProxyRef.current;
		window.ifr = controlProxyRef.current;
	}, [queueManager.iframeTarget]);



	return (
		<video
			ref={playerRef}
			className="url-player"
			src={queueManager.currentSong.videoURL}
			autoPlay={queueManager.autoPlay}
			controls={false}
			playsInline={true}
			onPlay={(e) => {
				console.log('play', e);
				queueManager.setPlayState('playing');
				window.dispatchEvent(new Event('video-play'));
			}}
			onPause={(e) => {
				console.log('pause', e);
				queueManager.setPlayState('paused');
			}}
			onEnded={(e) => {
				console.log('ended', e);
				queueManager.setPlayState('ended');
				queueManager.onSongEnd();
			}}
			/*onError={(e) => {
				console.log(e);
				queueManager.setPlayState('ended');
				queueManager.onSongEnd();
			}}*/
			onLoadedData={(e) => {
				console.log('loaded data', e);
				if (queueManager.playState === 'cued') {
					queueManager.setPlayState('unstarted');
				} else if (queueManager.playState === 'buffering') {
					queueManager.setPlayState('playing');
				}
				window.dispatchEvent(new Event('video-play'));
			}}
			onCanPlay={(e) => {
				console.log('can play', e);
				if (queueManager.playState === 'cued') {
					queueManager.setPlayState('unstarted');
				} else if (queueManager.playState === 'buffering') {
					queueManager.setPlayState('playing');
				}
				window.dispatchEvent(new Event('video-play'));
			}}
			onWaiting={(e) => {
				console.log('waiting', e);
				queueManager.setPlayState('buffering');
			}}
		/>
	);
}