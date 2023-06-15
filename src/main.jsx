import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import useRefState from './hooks/useRefState.js'
import useRefStateStorage from './hooks/useRefStateStorage.js'
import useShuffleDeque from './hooks/useShuffleDeque.js'
import './index.scss'


import { ThemeColorSetContext } from './contexts/ThemeColorSetContext.jsx'
import { argbFromHex, themeFromSourceColor, sourceColorFromImage, applyTheme, QuantizerCelebi, Score } from '@material/material-color-utilities'
import { applyNewMdTokens } from './utils.js'
function ThemeManager(props) {
	const [themeColor, setThemeColor] = useState('#ed9ca5');
	const [systemDark, setSystemDark] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);

	useLayoutEffect(() => {
		const theme = themeFromSourceColor(typeof(themeColor) === 'string' ? argbFromHex(themeColor) : themeColor);
		applyNewMdTokens(theme, systemDark);
		window.dispatchEvent(new CustomEvent('theme-change', {detail: {theme, systemDark}}));
	}, [themeColor, systemDark]);

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const listener = (e) => {
			setSystemDark(e.matches);
		};
		mediaQuery.addEventListener('change', listener);
		return () => {
			mediaQuery.removeEventListener('change', listener);
		};
	}, []);

	return (
		<ThemeColorSetContext.Provider value={{setThemeColor}}>
			{props.children}
		</ThemeColorSetContext.Provider>
	)
}


import { QueueContext } from './contexts/QueueContext.jsx'
function QueueManager(props) {
	const [queue, queueRef, setQueue] = useRefStateStorage([], 'playQueue');
	const [playMode, playModeRef, setPlayMode] = useRefStateStorage('repeat', 'playMode');
	const [currentIndex, currentIndexRef, setCurrentIndex] = useRefStateStorage(null, 'queueIndex');

	const currentSong = currentIndex !== null ? queue?.[currentIndex] : null;
	
	const [playState, setPlayState] = useState('cued'); // ['unstarted', 'ended', 'playing', 'paused', 'buffering', 'cued']
	const currentTime = useRef(0);
	const duration = useRef(0);
	const iframeTarget = useRef(null);
	const [autoPlay, setAutoPlay] = useState(false);

	useEffect(() => {
		console.log('playState', playState);
	}, [playState]);

	const setQueueAndIndex = (newQueue, newIndex) => {
		setQueue(newQueue);
		setCurrentIndex(newIndex);
		shuffleSetList(newQueue, [newQueue[newIndex]]);
		setAutoPlay(true);
	};
	const clearQueue = () => {
		setQueueAndIndex([], null);
	};

	const playSong = (song, resetShuffle = true) => {
		playSongByIndex(queueRef.current.findIndex((s) => s.hash === song.hash), resetShuffle);
	};
	const playSongByIndex = (index, resetShuffle = true) => {
		setCurrentIndex(index);
		if (resetShuffle) shuffleSetList(queueRef.current, [queueRef.current[index]]);
		setAutoPlay(true);
	};
	const removeSong = (song, autoPlayNextSong = true) => {
		removeSongByIndex(queueRef.current.findIndex((s) => s.hash === song.hash), autoPlayNextSong);
	};
	const removeSongByIndex = (index, autoPlayNextSong = true) => {
		if (currentIndex === index) {
			setCurrentIndex(currentIndexRef.current === queueRef.current.length - 1 ? queueRef.current.length - 2 : currentIndexRef.current);
		} else if (currentIndex > index) {
			setCurrentIndex(currentIndexRef.current - 1);
		}
		const newQueue = queueRef.current.filter((_, i) => i !== index);
		setQueue(newQueue);
		shuffleSetList(newQueue, [newQueue[currentIndex]]);
		setAutoPlay(autoPlayNextSong);
	};


	useLayoutEffect(() => {
		currentTime.current = 0;
		duration.current = 0;
		setPlayState('cued');
	}, [currentSong]);

	const pause = () => {
		iframeTarget.current.pauseVideo();
	}
	const play = () => {
		iframeTarget.current.playVideo();
	}

	const [shufflePrev, shuffleNext, shuffleSetList] = useShuffleDeque(queue, [currentSong]);


	const onSongEnd = () => {
		if (playModeRef.current === 'loop') {
			iframeTarget.current.seekTo(0);
			iframeTarget.current.playVideo();
		} else if (playModeRef.current === 'repeat') {
			const nextIndex = (currentIndex + 1) % queue.length;
			setCurrentIndex(nextIndex);
			setAutoPlay(true);
		} else if (playModeRef.current === 'shuffle') {
			const nextSong = shuffleNext();
			playSong(nextSong, false);
			setAutoPlay(true);
		}
	}
	const nextSong = () => {
		if (playModeRef.current === 'loop') {
			iframeTarget.current.seekTo(0);
			iframeTarget.current.playVideo();
		} else if (playModeRef.current === 'repeat') {
			const nextIndex = (currentIndex + 1) % queue.length;
			setCurrentIndex(nextIndex);
			setAutoPlay(true);
		} else if (playModeRef.current === 'shuffle') {
			const nextSong = shuffleNext();
			playSong(nextSong, false);
		}
	}
	const prevSong = () => {
		if (playModeRef.current === 'loop') {
			iframeTarget.current.seekTo(0);
			iframeTarget.current.playVideo();
		} else if (playModeRef.current === 'repeat') {
			const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
			setCurrentIndex(prevIndex);
			setAutoPlay(true);
		} else if (playModeRef.current === 'shuffle') {
			const prevSong = shufflePrev();
			playSong(prevSong, false);
		}
	}


	return (
		<QueueContext.Provider value={{
			currentSong,
			queue,
			currentIndex,
			setQueueAndIndex,
			clearQueue,
			playSong, playSongByIndex,
			nextSong, prevSong,
			removeSong, removeSongByIndex,
			autoPlay,
			playMode, setPlayMode,
			play, pause,
			playState, setPlayState,
			currentTime,
			duration,
			iframeTarget,
			onSongEnd,
		}}>
			{
				props.children
			}
		</QueueContext.Provider>			
	)
}


ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<ThemeManager>
			<QueueManager>
				<App />
			</QueueManager>
		</ThemeManager>
	</React.StrictMode>,
)
