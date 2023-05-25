import { useEffect, useLayoutEffect, useState } from 'react'
import Toolbar from './components/Toolbar.jsx'
import Card from './components/Card.jsx'
import { SongListSection } from './SongListSection.jsx'
import './App.scss'

function App() {
	return (
		<>
			<Toolbar
				title="MIMI Radio"
			/>
			<div className="main">
				<SongListSection/>
				<div className="info-section">
				</div>
			</div>						
		</>
	)
}

export default App
