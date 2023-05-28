import './NowPlayingSection.scss';
import { VideoPlayer } from './Player.jsx';
import { Lyrics } from './Lyrics.jsx';
import { Controller } from './Controller.jsx';


export function NowPlayingSection(props) {
	return (
		<div className="now-playing-section">
			<VideoPlayer/>
			<Lyrics/>
			<Controller/>
		</div>
	)
}



