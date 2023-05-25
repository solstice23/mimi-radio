import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
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
	const [queue, setQueue] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(null);

	const currentSong = currentIndex !== null ? queue?.[currentIndex] : null;
	
	const [playState, setPlayState] = useState('cued'); // ['unstarted', 'ended', 'playing', 'paused', 'buffering', 'cued']
	const currentTime = useRef(0);
	const duration = useRef(0);
	const iframeTarget = useRef(null);

	const setQueueAndIndex = (newQueue, newIndex) => {
		setQueue(newQueue);
		setCurrentIndex(newIndex);
	};

	useLayoutEffect(() => {
		currentTime.current = 0;
		duration.current = 0;
	}, [currentSong]);

	return (
		<QueueContext.Provider value={{
			currentSong,
			queue,
			currentIndex,
			setQueueAndIndex,
			playState,
			setPlayState,
			currentTime,
			duration,
			iframeTarget
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
