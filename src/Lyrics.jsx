import { useEffect, useState, useReducer, useRef, useContext, useLayoutEffect } from 'react';
import Card from './components/Card.jsx';
import IconButton from './components/IconButton.jsx';
import { MdOpenInFull, MdCloseFullscreen } from 'react-icons/md';

import { QueueContext } from './contexts/QueueContext.jsx';
import classNames from 'classnames';
import useRefState from './hooks/useRefState.js';
import useStateStorage from './hooks/useStateStorage.js';
import Checkbox from './components/Checkbox.jsx';
import useAsyncCachedFetch from './hooks/useAsyncCachedFetch.js';

export function Lyrics(props) {
	const queueManager = useContext(QueueContext);

	//const [lyrics, lyricsRef, setLyrics] = useRefState(null);
	//const [loading, loadingRef, setLoading] = useRefState(false);
	const [currentLine, currentLineRef, setCurrentLine] = useRefState(0);
	const lastCurrentLineRef = useRef(0);

	const [enableEn, setEnableEn] = useStateStorage(navigator.languages.includes('en-US'), 'lyrics-en');
	const [enableCn, setEnableCn] = useStateStorage(navigator.languages.includes('zh-CN'), 'lyrics-cn');
	const [enableRo, setEnableRo] = useStateStorage(false, 'lyrics-ro');

	const containerRef = useRef(null);

	//const cacheRef = useRef({});

	/*useEffect(() => {
		async function loadLyrics() {
			const json = cacheRef.current[queueManager.currentSong.lyrics] ?? await fetch(queueManager.currentSong.lyrics).then(res => res.json());
			cacheRef.current[queueManager.currentSong.lyrics] = json;
			setLyrics(json);
			setLoading(false);
			setCurrentLine(0);
		}
		if (queueManager.currentSong?.lyrics) {
			setLyrics(null);
			setCurrentLine(0);
			setLoading(true);
			loadLyrics();
		} else {
			setLyrics(null);
		}
	}, [queueManager.currentSong]);*/
	const lyricsUrl = queueManager.currentSong?.lyrics ?? null;
	const [lyrics, loadingState] = useAsyncCachedFetch(lyricsUrl);

	const loading = loadingState === 'pending';
	const lyricsRef = useRef(lyrics);
	useLayoutEffect(() => {
		lyricsRef.current = lyrics;
		updateCurrentLine();
	}, [lyrics]);


	const updateCurrentLine = () => {
		if (!lyricsRef.current) return;
		if (!queueManager.iframeTarget?.current) return;
		const currentTime = queueManager.iframeTarget.current?.getCurrentTime() * 1000;
		let targetLine = 0;
		for (let i = 0; i < lyricsRef.current.length; i++) {
			if (lyricsRef.current[i].time > currentTime) {
				break;
			}
			targetLine = i;
		}
		lastCurrentLineRef.current = currentLineRef.current;
		setCurrentLine(targetLine);
	}
	useEffect(() => {
		if (queueManager.playState === 'playing') {
			updateCurrentLine();
			const interval = setInterval(updateCurrentLine, 25);
			return () => clearInterval(interval);
		}
	}, [queueManager.playState]);


	const [lineAttrs, lineAttrsRef, setLineAttrs] = useRefState([]);

	const getDelay = (offset) => {
		if (lastCurrentLineRef.current === currentLineRef.current) return 0;
		const sign = lastCurrentLineRef.current > currentLineRef.current ? -1 : 1;
		return (Math.max(-4, Math.min(4, offset)) * sign + 4) * 50;
	}
	const recalculate = (animation = true) => {
		if (!containerRef.current) return;
		if (!lyricsRef.current) return;

		const containerHeight = containerRef.current?.clientHeight;
		const lineHeights = Array.from(containerRef.current?.children)?.map(child => child.clientHeight);

		if (!containerHeight || !lineHeights) return;

		const attrs = [];
		for (let i = 0; i < lineHeights.length; i++) {
			attrs.push({});
		}

		const cur = currentLineRef.current;

		const em = getComputedStyle(containerRef.current).fontSize.replace('px', '');
		const gap = 1.3 * em;


		attrs[cur].center = containerHeight / 2;
		attrs[cur].scale = 1;
		if (lyricsRef.current[cur].interlude) attrs[cur].scale = 10;
		for (let i = cur - 1; i >= 0; i--) {
			attrs[i].scale = 0.85;
			attrs[i].center = attrs[i + 1].center - (lineHeights[i + 1] / 2) * attrs[i + 1].scale - gap - (lineHeights[i] / 2) * attrs[i].scale;
		}
		for (let i = cur + 1; i < lineHeights.length; i++) {
			attrs[i].scale = 0.85;
			attrs[i].center = attrs[i - 1].center + (lineHeights[i - 1] / 2) * attrs[i - 1].scale + gap + (lineHeights[i] / 2) * attrs[i].scale;
		}
		attrs[cur].scale = 1;
		for (let i = 0; i < lineHeights.length; i++) {
			attrs[i].delay = getDelay(i - cur);
			attrs[i].top = attrs[i].center - (lineHeights[i] / 2) * attrs[i].scale;
			if (!animation) {
				attrs[i].delay = 0;
				attrs[i].noAnimation = true;
			}
		}

		setLineAttrs(attrs);
	}

	useEffect(() => {
		recalculate();
	}, [currentLine, enableCn, enableRo, enableEn]);

	useLayoutEffect(() => {
		if (!containerRef.current) return;
		const resizeObserver = new ResizeObserver(() => {
			recalculate(false);
		});
		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, [lyrics]);
	useLayoutEffect(() => {
		recalculate(false);
	}, [lyrics]);


	return (
		<Card
		className={classNames(
			"lyrics-container",
			{
				"no-lyrics": lyrics === null
			}
		)}
		ripple={false}
		layer={false}>
			{
				lyrics &&
				<div className="lyrics" ref={containerRef}>
					{
						lyrics.map((line, index) => {
							return (
								<Line 
									key={index}
									index={index}
									line={line}
									enableCn={enableCn}
									enableRo={enableRo}
									enableEn={enableEn}
									attrs={lineAttrs[index]}
									currentLine={currentLine}
								/>
							)
						})
					}
				</div>
			}
			<div 
				className={
					classNames(
						"no-lyrics-text",
						{
							"show": lyrics === null || loading
						}
					)
				}>
					<div className="no-lyrics-text-inner">
						{
							(loading || lyrics) ?
							'Loading lyrics...'
							:
							'No lyrics'
						}
					</div>
					
			</div>
			<IconButton
				className="player-control-btn lyrics-fullscreen"
				onClick={() => {
					document.body.setAttribute("now-view-transition", "lyrics");
					if (document.startViewTransition) {
						document.startViewTransition(() => {
							document.body.classList.add('lyrics-exclusive');
						});
					} else {
						document.body.classList.add('lyrics-exclusive');
					}
					recalculate(false);
				}}
			>
				<MdOpenInFull/>
			</IconButton>
			<IconButton
				className="player-control-btn lyrics-exit-fullscreen"
				onClick={() => {
					document.body.setAttribute("now-view-transition", "lyrics");
					if (document.startViewTransition) {
						document.startViewTransition(() => {
							document.body.classList.remove('lyrics-exclusive');
						});
					} else {
						document.body.classList.remove('lyrics-exclusive');
					}
				}}
			>
				<MdCloseFullscreen/>
			</IconButton>
			{
				lyrics && (lyrics.some(line => line.en) || lyrics.some(line => line.cn) || lyrics.some(line => line.ro)) &&
				<div className="lyrics-switch">
					{
						lyrics.some(line => line.en) &&
						<Checkbox
							checked={enableEn}
							onChange={e => setEnableEn(e)}
							label="English"
						>
						</Checkbox>
					}
					{
						lyrics.some(line => line.cn) &&
						<Checkbox
							checked={enableCn}
							onChange={e => setEnableCn(e)}
							label="Chinese"
						>
						</Checkbox>
					}
					{
						lyrics.some(line => line.ro) &&
						<Checkbox
							checked={enableRo}
							onChange={e => setEnableRo(e)}
							label="Romaji"
						>
							Romaji
						</Checkbox>
					}
				</div>
			}
			


		</Card>
	)
}


function Line(props) {
	return (
		<div className={
				classNames(
					"lyrics-line",
					{
						"current": props.currentLine == props.index,
						"interlude": props.line.interlude,
						"no-animation": props?.attrs?.noAnimation
					}
				)
			}
			offset={props.index - props.currentLine}
			style={{
				transform: `translateY(${props?.attrs?.top}px) scale(${props?.attrs?.scale})`,
				//transitionDelay: `${props?.attrs?.delay}ms`
			}}
		>
			{
				props.line.text &&
				<div className="lyrics-line-origin">
					{ props.line.text }
				</div>
			}
			{
				props.enableEn && props.line.en &&
				<div className="lyrics-line-en">
					{ props.line.en }
				</div>
			}
			{
				props.enableCn && props.line.cn &&
				<div className="lyrics-line-cn">
					{ props.line.cn }
				</div>
			}
			{
				props.enableRo && props.line.ro &&
				<div className="lyrics-line-ro">
					{ props.line.ro }
				</div>
			}
		</div>
	)
}