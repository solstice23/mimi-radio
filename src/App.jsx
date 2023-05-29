import { useEffect, useLayoutEffect, useState } from 'react'
import Toolbar from './components/Toolbar.jsx'
import Card from './components/Card.jsx'
import { SongListSection } from './SongListSection.jsx'
import { NowPlayingSection } from './NowPlayingSection.jsx'
import './App.scss'

function App() {
	const onScroll = () => {
		//document.body.classList.toggle('now-playing-bottom', window.innerWidth <= 950);
		console.log("fuck");
		if (document.documentElement.scrollTop !== 0) {
			document.documentElement.scrollTop = 0;
		}
	}
	useEffect(() => {
		document.documentElement.addEventListener('scroll', onScroll);
		onScroll();
		return () => {
			document.documentElement.removeEventListener('scroll', onScroll);
		};
	}, []);

	return (
		<>
			<Toolbar
				title="MIMI Radio"
			/>
			<div className="main">
				<SongListSection/>
				<NowPlayingSection/>
			</div>
		</>
	)
}

export default App
