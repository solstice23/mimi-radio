import { useEffect, useState, useReducer, useRef, useContext } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit'
import { getSongsData, formatLength, formatDate } from './utils.js'
import Icon from './components/Icon.jsx'
import SegmentedButtons from './components/SegmentedButtons.jsx'
import Card from './components/Card.jsx';
import Tag from './components/Tag.jsx';
import IconButton from './components/IconButton.jsx';
import Menu from './components/Menu.jsx';
import MenuItem, {MenuDivider} from './components/MenuItem.jsx';
import Checkbox from './components/Checkbox.jsx';
import NowPlayingIndicatorIcon from './components/NowPlayingIndicatorIcon.jsx';
import { MdDesignServices, MdMic, MdPlayCircleOutline, MdSort, MdSchedule, MdCalendarMonth, MdSortByAlpha, MdSwapVert, MdOpenInNew } from 'react-icons/md';
import { QueueContext } from './contexts/QueueContext.jsx';
import classNames from 'classnames';
import './SongListSection.scss';
import useStateStorage from './hooks/useStateStorage.js';

const songs = getSongsData();

export function SongListSection(props) {
	const queueManager = useContext(QueueContext);

	const [selectedTypes, setSelectedTypes] = useStateStorage(['standalone', 'collab'], 'song-type-filter');
	const [sortCriteria, setSortCriteria] = useStateStorage('date', 'song-sort-criteria');
	const [sortDirection, setSortDirection] = useStateStorage('asc', 'song-sort-direction');

	const filteredSongs = songs
		.filter((song) => selectedTypes.includes(song.type.toLowerCase()))
		.sort((a, b) => {
			return (() => {
				if (sortCriteria === 'date') {
					return b.releaseDate.getTime() - a.releaseDate.getTime();
				}
				if (sortCriteria === 'name') {
					return a.name.localeCompare(b.name)
				}
				if (sortCriteria === 'length') {
					return a.length - b.length;
				}
				return 0;
			})() * (sortDirection === 'asc' ? 1 : -1);
		});

	return (
		<div className="list-section">
			<div className="list-section-header">
				<SegmentedButtons
					className="song-type-filter"
					buttons={[
						{label: 'Standalone', value: 'standalone', selected: selectedTypes.includes('standalone')},
						{label: 'Collab', value: 'collab', selected: selectedTypes.includes('collab')},
						{label: 'Short', value: 'short', selected: selectedTypes.includes('short')},
					]}
					multiple={true}
					setSelected={setSelectedTypes}
				/>
				<SongFilter
					setSortCriteria={setSortCriteria}
					setSortDirection={setSortDirection}
				/>
			</div>
			<Flipper className="song-list" flipKey={JSON.stringify(filteredSongs)}>
				<div className="song-list-inner">
					{filteredSongs.map((song, index) => (
						<Flipped
							key={song.hash}
							flipId={song.hash}
							onAppear={(el, index) => {
								el.animate([
									{ opacity: 0 },
									{ opacity: 1 }
								], {
									duration: 150,
									easing: 'ease-out'
								}).onfinish = () => el.style = '';
							}}
							onExit={(el, index, removeElement) => {
								el.animate([
									{ opacity: 1 },
									{ opacity: 0 }
								], {
									duration: 150,
									easing: 'ease-out'
								}).onfinish = () => removeElement();
							}}
						>
							<div>
								<Song
									song={song}
									playing={queueManager.currentSong?.hash === song.hash}
									onClick={() => {
										queueManager.setQueueAndIndex(filteredSongs, index);
									}}
								/>
							</div>
						</Flipped>
					))}
				</div>
			</Flipper>
		</div>
	)
}

function SongFilter(props) {
	const [open, setOpen] = useState(false);
	const openBtnRef = useRef(null);
	const menuRef = useRef(null);

	const [sortCriteria, setSortCriteria] = useState('date');
	useEffect(() => {
		props.setSortCriteria(sortCriteria);
	}, [sortCriteria]);

	const [sortDirection, setSortDirection] = useState('asc');
	useEffect(() => {
		props.setSortDirection(sortDirection);
	}, [sortDirection]);

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
		<>
			<IconButton
				ref={openBtnRef}
				className="song-filter-btn"
				title="Sort"
				type={open ? 'tonal' : 'outlined'}
				selected={open}
				onClick={(e) => {
					setOpen(!open);
				}}
			>
				<MdSort/>
			</IconButton>
			<Menu
				ref={menuRef}
				className="song-filter-menu"
				anchorElement={openBtnRef?.current}
				anchorPosition="right top"
				open={open}
			>
				<MenuItem
					icon={<MdCalendarMonth/>}
					checkbox
					onChange={(e) => {
						setSortCriteria('date');
					}}
					checked={sortCriteria === 'date'}
				>
					Release Date
				</MenuItem>
				<MenuItem
					icon={<MdSchedule/>}
					checkbox
					onChange={(e) => {
						setSortCriteria('length');
					}}
					checked={sortCriteria === 'length'}
				>
					Length
				</MenuItem>
				<MenuItem
					icon={<MdSortByAlpha/>}
					checkbox
					onChange={(e) => {
						setSortCriteria('name');
					}}
					checked={sortCriteria === 'name'}
				>
					Name
				</MenuItem>
				<MenuDivider/>
				<MenuItem
					icon={<MdSwapVert/>}
					checkbox
					onChange={(e) => {
						if (sortDirection === 'asc') {
							setSortDirection('desc');
						} else {
							setSortDirection('asc');
						}
					}}
					checked={sortDirection === 'desc'}
				>
					Descending
				</MenuItem>
			</Menu>
		</>
	)
}

function Song(props) {
	const queueManager = useContext(QueueContext);

	const onClick = (e) => {
		console.log('play', props.song);
		props.onClick();
	}

	return (
		<Card
			className={
				classNames(
					"song",
					{
						playing: props.playing
					}
				)
			}
			onDoubleClick={onClick}
		>
			<div
				className="song-cover" 
				style={{
					backgroundImage: `url(${new URL(`./data/covers/${props.song.cover}`, import.meta.url).href.replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')})`
				}}
			/>
			<div className="song-info">
				<div className="song-title">
					<div className='song-name'>{props.song.name}</div>
				</div>
				<div className="song-creators">
					{
						props.song.artist &&
						<div className="song-artist">
							<MdDesignServices/>
							{props.song.artist.split(',').map((x) => x.trim()).join(', ')}
						</div>
					}
					{
						props.song.singer &&
						<div className="song-singer">
							<MdMic/>
							{props.song.singer.split(',').map((x) => x.trim()).join(', ')}
						</div>
					}
				</div>
				<div className="song-metas">
					<Tag className="song-type">{props.song.type}</Tag>
					<div className="song-date">{formatDate(props.song.releaseDate)}</div>
					<div className="song-length">{formatLength(props.song.length)}</div>
				</div>
			</div>
			<div className="song-actions">
				{
					props.song.link &&
					<a href={props.song.link} target="_blank" rel="noopener noreferrer" style={{borderRadius: '50%'}}>
						<IconButton
							className="auto-hide"
							title="Open in YouTube"
						>
								<MdOpenInNew/>
						</IconButton>
					</a>
				}
				{
					!props.playing ?
						<IconButton
							title="Play"
							onClick={onClick}
						>
							<MdPlayCircleOutline/>
						</IconButton>
					:
						<IconButton
							className="playing-icon"
							title="Playing"
						>
							<NowPlayingIndicatorIcon paused={queueManager.playState === 'paused' || queueManager.playState === 'ended' || queueManager.playState === 'unstarted' || queueManager.playState === 'cued'} />
						</IconButton>
				}
			</div>
		</Card>
	)
}