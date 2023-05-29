import { useEffect, useLayoutEffect, useState } from 'react'
import Toolbar from './components/Toolbar.jsx'
import Card from './components/Card.jsx'
import { SongListSection } from './SongListSection.jsx'
import { NowPlayingSection } from './NowPlayingSection.jsx'
import './App.scss'

function App() {
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
