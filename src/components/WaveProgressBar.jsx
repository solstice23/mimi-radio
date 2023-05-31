import { forwardRef, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import css from './WaveProgressBar.module.scss';

const WaveProgressBar = forwardRef(function WaveProgressBar(props, ref){
	if (ref == null) ref = useRef(null);

	const [progress, setProgress] = useState(props.defaultProgress ?? 0);

	const isDragging = useRef(false);
	const handleRef = useRef(null);
	const controlTrackRef = useRef(null);

	let currentProgress = isDragging.current ? 
		progress:
		props.progress !== undefined ? props.progress : progress;

	if (currentProgress !== currentProgress) currentProgress = 0;

	const getPercentByEvent = (e) => {
		const clientX = e.clientX ?? e?.touches[0]?.clientX ?? e.changedTouches[0]?.clientX;
		const rect = ref.current.getBoundingClientRect();
		const x = clientX - (rect.left + 20);
		const width = rect.right - rect.left - 40;
		return Math.max(Math.min(x / width * 100, 100), 0);
	}

	const handleMouseDown = (e) => {
		isDragging.current = true;
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('touchmove', handleMouseMove);
		window.addEventListener('touchend', handleMouseUp);
		const newProgress = getPercentByEvent(e);
		setProgress(newProgress);
		props.onInput?.(newProgress);
	}
	const handleMouseMove = (e) => {
		if (isDragging.current) {
			const newProgress = getPercentByEvent(e);
			setProgress(newProgress);
			props.onInput?.(newProgress);
		}
	}
	const handleMouseUp = (e) => {
		isDragging.current = false;
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
		window.removeEventListener('touchmove', handleMouseMove);
		window.removeEventListener('touchend', handleMouseUp);
		const newProgress = getPercentByEvent(e);
		setProgress(newProgress);
		props.onInput?.(newProgress);
		props.onChange?.(newProgress);
	}
	const controlTrackMouseDown = (e) => {
		isDragging.current = true;
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('touchmove', handleMouseMove);
		window.addEventListener('touchend', handleMouseUp);
		const newProgress = getPercentByEvent(e);
		setProgress(newProgress);
		props.onChange?.(newProgress);
	}

	useEffect(() => {
		const handle = handleRef.current;
		handle.addEventListener('mousedown', handleMouseDown);
		handle.addEventListener('touchstart', handleMouseDown);
		controlTrackRef.current.addEventListener('mousedown', controlTrackMouseDown);
		controlTrackRef.current.addEventListener('touchstart', controlTrackMouseDown);
		return () => {
			handle.removeEventListener('mousedown', handleMouseDown);
			handle.removeEventListener('touchstart', handleMouseDown);
			controlTrackRef.current.removeEventListener('mousedown', controlTrackMouseDown);
			controlTrackRef.current.removeEventListener('touchstart', controlTrackMouseDown);
		}
	}, []);

	return (
		<div
			ref={ref}
			className={classNames(
				css.waveProgressBar,
				props.className,
				{
					[css.paused]: props.paused,
					[css.disabled]: props.disabled,
				}
			)}
			style={{
				'--progress': `${currentProgress ?? 0}%`,
				...props.style,
			}}
		>
			<div className={classNames('wave-progress-bar-track', css.track)}>
				<div className={classNames('wave-progress-bar-played', css.played)}>
					<SinWave paused={props.paused} disabled={props.disabled}/>
				</div>
				<div className={classNames('wave-progress-bar-unplayed', css.unplayed)}></div>
				<div className={classNames('wave-progress-bar-control', css.control)} ref={controlTrackRef}></div>
			</div>
			<div className={classNames('wave-progress-bar-handleContainer', css.handleContainer)}>
				<div className={classNames('wave-progress-bar-handle', css.handle)} ref={handleRef}></div>
			</div>
		</div>
	)
});

function SinWave(props) {
	const canvasRef = useRef(null);

	const targetAmplitudeMultiplierRef = useRef(props.paused ? 0 : 1);
	const amplitudeMultiplier = useRef(props.paused ? 0 : 1);

	const disabledRef = useRef(false);

	const draw = (canvas) => {
		if (targetAmplitudeMultiplierRef.current !== amplitudeMultiplier.current) {
			amplitudeMultiplier.current += (targetAmplitudeMultiplierRef.current - amplitudeMultiplier.current) * 0.1;
			if (Math.abs(targetAmplitudeMultiplierRef.current - amplitudeMultiplier.current) < 0.001) {
				amplitudeMultiplier.current = targetAmplitudeMultiplierRef.current;
			}
		}
		const ctx = canvas.getContext('2d');
		const width = canvas.offsetWidth;
		const height = canvas.offsetHeight;
		canvas.width = width;
		canvas.height = height;
		const length = 32;

		ctx.clearRect(0, 0, width, height);
		ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('--md-sys-color-primary');
		if (disabledRef.current) ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('--md-sys-color-on-surface');
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(0, height / 2);
		for (let x = 0; x < width; x++) {
			const y = Math.sin(x / length * Math.PI * 2) * (height / 2 - ctx.lineWidth / 2) * amplitudeMultiplier.current + height / 2;
			ctx.lineTo(x, y);
		}
		ctx.moveTo(width, height / 2);
		ctx.closePath();
		ctx.stroke();
		requestAnimationFrame(() => draw(canvas));
	}

	useEffect(() => {
		draw(canvasRef.current);
		/*window.addEventListener('resize', () => draw(canvasRef.current));
		window.addEventListener('theme-change', () => draw(canvasRef.current));
		return () => {
			window.removeEventListener('resize', () => draw(canvasRef.current));
			window.removeEventListener('theme-change', () => draw(canvasRef.current));
		}*/
	}, []);

	
	useEffect(() => {
		//draw(canvasRef.current);
		targetAmplitudeMultiplierRef.current = props.paused ? 0 : 1;
	}, [props.paused]);

	useEffect(() => {
		disabledRef.current = props.disabled ?? false;
	}, [props.disabled]);

	return (
		<canvas
			ref={canvasRef}
			className={css.sinWave}
		></canvas>
	)
}

export default WaveProgressBar;