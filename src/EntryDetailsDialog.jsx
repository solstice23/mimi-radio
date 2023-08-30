import './EntryDetailsDialog.scss';

import Dialog from './components/Dialog.jsx';

import { getSongsData, formatLength, formatDate, formatLyricTimestamp } from './utils.js'

const songs = getSongsData();

import { MdDesignServices, MdMic, MdSchedule, MdCalendarMonth, MdOutlineInfo, MdTranslate, MdGroups, MdCategory } from 'react-icons/md';

import { useRipple } from './components/Ripple';

import { QueueContext } from './contexts/QueueContext.jsx';
import classNames from 'classnames';
import { useContext, useEffect, useState, useRef, useLayoutEffect } from 'react';
import useAsyncCachedFetch from './hooks/useAsyncCachedFetch.js';

import LazyImg from './components/LazyImg.jsx';

import Tabs from './components/Tabs.jsx';
import Tab from './components/Tab.jsx';
import Radio from './components/Radio.jsx';
import RadioGroup from './components/RadioGroup.jsx';
import Checkbox from './components/Checkbox.jsx';
import Select from './components/Select.jsx';

import base64 from 'base-64';
import utf8 from 'utf8';


const getCurrentUrlHashSongId = () => {
	let hash = window.location.hash;
	if (hash.startsWith('#')) {
		hash = hash.substring(1);
	}
	if (!hash.startsWith('detail-')) {
		return null;
	}
	hash = hash.substring('detail-'.length);
	if (hash.length === 0) {
		return null;
	}
	hash = base64.decode(hash);
	hash = utf8.decode(hash);
	return hash;
}

const getDetailMetaBySongHash = (songHash) => {
	const song = songs.find(song => song.hash === songHash);
	if (!song) {
		return null;
	}
	return song;
}

const initialSongMeta = getDetailMetaBySongHash(getCurrentUrlHashSongId());

export function EntryDetailsDialog() {
	const queueManager = useContext(QueueContext);

	const ref = useRef();
	const coverRef = useRef();

	const [meta, setMeta] = useState(initialSongMeta);
	const [open, setOpen] = useState(!!initialSongMeta);

	useEffect(() => {
		const onHashChange = () => {
			const songHash = getCurrentUrlHashSongId();
			const meta = getDetailMetaBySongHash(songHash);
			setOpen(!!meta);
			if (meta) {
				setMeta(meta);
			}
		}
		window.addEventListener('hashchange', onHashChange);
		return () => {
			window.removeEventListener('hashchange', onHashChange);
		}
	}, []);

	useLayoutEffect(() => {
		ref.current.classList.remove('no-scale-animation');
		if (!document.startViewTransition) {
			return;
		}
		if (!meta) {
			return;
		}
		const itemInList = document.querySelector(`.song-list .song[hash="${meta.hash}"]`);
		if (!itemInList) return;
		const itemInListRect = itemInList.getBoundingClientRect();
		if (itemInListRect.bottom < 150 || itemInListRect.top > window.innerHeight) {
			return;
		}
		ref.current.classList.add('no-scale-animation');
		document.body.setAttribute("now-view-transition", "entry-detail-dialog");
		if (open) {
			itemInList.style.setProperty('view-transition-name', 'entry-details-dialog');
			ref.current.style.removeProperty('view-transition-name');
			itemInList.querySelector('.song-cover').style.setProperty('view-transition-name', 'entry-details-dialog-cover');
			coverRef.current.style.removeProperty('view-transition-name');
			document.startViewTransition(() => {
				itemInList.style.removeProperty('view-transition-name');
				ref.current.style.setProperty('view-transition-name', 'entry-details-dialog');
				itemInList.querySelector('.song-cover').style.removeProperty('view-transition-name');
				coverRef.current.style.setProperty('view-transition-name', 'entry-details-dialog-cover');
			}).finished.then(() => {
				document.querySelectorAll('.song-list .song[style*=view-transition-name]').forEach(el => {
					el.style.removeProperty('view-transition-name');
					el.querySelector('.song-cover').style.removeProperty('view-transition-name');
				});
			});
		} else {
			ref.current.style.setProperty('view-transition-name', 'entry-details-dialog');
			itemInList.style.removeProperty('view-transition-name');
			coverRef.current.style.setProperty('view-transition-name', 'entry-details-dialog-cover');
			itemInList.querySelector('.song-cover').style.removeProperty('view-transition-name');
			document.startViewTransition(() => {
				ref.current.style.removeProperty('view-transition-name');
				itemInList.style.setProperty('view-transition-name', 'entry-details-dialog');
				coverRef.current.style.removeProperty('view-transition-name');
				itemInList.querySelector('.song-cover').style.setProperty('view-transition-name', 'entry-details-dialog-cover');
			}).finished.then(() => {
				document.querySelectorAll('.song-list .song[style*=view-transition-name]').forEach(el => {
					el.style.removeProperty('view-transition-name');
					el.querySelector('.song-cover').style.removeProperty('view-transition-name');
				});
			});
		}
	}, [open]);


	return (
		<Dialog
			innerRef={ref}
			className='details-dialog'
			title={meta?.name ?
				<div className='details-dialog-header'>
					<LazyImg
						className="cover"
						src={new URL(`./data/covers/${meta.cover}`, import.meta.url).href.replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')}
						rawSrc={meta.cover}
						alt={meta.name}
						containerRef={coverRef}
					/>
					<div className="name">{meta.name}</div>
				</div>
				: 'Loading...'}
			closeOnClickOutside={true}
			positiveButton="Close"
			onClose={() => {
				window.location.hash = '';
			}}
			onPositiveButtonClick={() => {
				window.location.hash = '';
			}}
			open={!!open}
		>
			<Tabs type="primary">
				<Tab label="Meta">
					<Meta meta={meta}/>
				</Tab>
				<Tab label="Lyrics">
					<Lyrics meta={meta}/>
				</Tab>
			</Tabs>
		</Dialog>
	)
}

function Meta({meta}) {
	return (
		meta &&
		<>
			<div className='details-dialog-list'>
				<ListItem
					icon={<MdCategory/>}
					title="Category"
				>
					{meta.type}
				</ListItem>
				{
					meta.translatedName &&
					<ListItem
						icon={<MdTranslate/>}
						title="Chinese Name"
					>
						{meta.translatedName}
					</ListItem>
				}
				<div className="list-row">
					<ListItem
						icon={<MdDesignServices/>}
						title="Composer"
					>
						{meta.artist}
					</ListItem>
					{
						meta.singer &&
						<ListItem
							icon={<MdMic/>}
							title="Singer"
						>
							{meta.singer}
						</ListItem>
					}
				</div>
				<ListItem
					icon={<MdSchedule/>}
					title="Length"
				>
					{formatLength(meta.length)}
				</ListItem>
				<ListItem
					icon={<MdCalendarMonth/>}
					title="Release"
				>
					{formatDate(meta.releaseDate)}
				</ListItem>
				{
					meta.staff &&
					<ListItem
						icon={<MdGroups/>}
						title="Creators"
						smaller
					>
						{
							meta.staff.split('\n').map((staff, i) => (
								<div key={i}>{staff}</div>
							))
						}
					</ListItem>
				}
				{
					meta.desc &&
					<ListItem
						icon={<MdOutlineInfo/>}
						title="Description"
						smaller
					>
						{
							meta.desc.split('\n').map((staff, i) => (
								<div key={i}>{staff}</div>
							))
						}
					</ListItem>
				}
			</div>
		</>
	)
}

function Lyrics({meta}) {
	const lyricsUrl = meta?.lyrics ?? null;
	const [lyrics, loadingStatus] = useAsyncCachedFetch(lyricsUrl);
	useEffect(() => {
		console.log(loadingStatus);
	}, [loadingStatus]);

	const loading = loadingStatus === 'pending';
	

	const [hasEn, hasCn, hasRo] = [lyrics?.some(line => line.en), lyrics?.some(line => line.cn), lyrics?.some(line => line.ro)];

	const hasTranslation = hasEn || hasCn || hasRo;
	const [translation, setTranslation] = useState('original');
	const [showTimeStamps, setShowTimeStamps] = useState(true);

	if (loading) {
		return (
			<div className="lyrics">
				<div className="loading">
					Loading...
				</div>
			</div>
		)
	}
	if (!loading && !lyrics) {
		return (
			<div className="lyrics">
				<div className="no-lyrics">
					No lyrics
				</div>
			</div>
		)
	}
	return (
		<div className="lyrics">
			<div className="lyrics-control">
				{
					hasTranslation &&
					<Select
						className="translation-selector"
						label="Translation"
						value={translation}
						onChange={setTranslation}
						options={[
							{ value: 'original', label: 'Original' },
							...(hasEn ? [{ value: 'en', label: 'English' }] : []),
							...(hasCn ? [{ value: 'cn', label: 'Chinese' }] : []),
							...(hasRo ? [{ value: 'ro', label: 'Romaji' }] : []),
						]}
					/>
				}

				<Checkbox
					checked={showTimeStamps}
					onChange={setShowTimeStamps}
					label="Timestamps"
				>
				</Checkbox>
			</div>
			<div className="lyrics-content">
				{
					lyrics.map((line, i) => (
						<div
							key={i}
							className={classNames('line', { 'interlude': line.interlude })}
						>
							{
								showTimeStamps &&
								<span className="time-stamp">
									{formatLyricTimestamp(line.time)}
								</span>
							}
							<span className="lyrics-text">
								{
									translation === 'original' ?
									line.text
									:
									line[translation]
								}
							</span>
						</div>
					))
				}
			</div>
		</div>			
	)
}

function ListItem({ icon, title, children, smaller }) {
	const ref = useRipple();
	return (
		<div className="list-item" ref={ref}>
			<div className="headline">
				{icon}
				<div className="title">
					{title}
				</div>
			</div>
			<div className={classNames('content', { 'smaller': smaller })}>
				{children}
			</div>
		</div>
	)
}