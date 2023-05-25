import React, { useEffect, useLayoutEffect, useState } from 'react'
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
		const theme = themeFromSourceColor(argbFromHex(themeColor));
		applyNewMdTokens(theme, systemDark);
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
		<ThemeColorSetContext.Provider value={setThemeColor}>
			{props.children}
		</ThemeColorSetContext.Provider>
	)
}

function QueueManager(props) {
	return (
		props.children
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
