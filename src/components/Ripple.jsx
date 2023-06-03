import { useEffect, useRef } from "react";
import css from './Ripple.module.scss';

function addRipple(e, target, options = {}) {
	if (getComputedStyle(target).position !== 'absolute' && getComputedStyle(target).position !== 'relative') {
		target.style.position = 'relative';
	}
	/*if (getComputedStyle(target).overflow !== 'hidden') {
		target.style.overflow = 'hidden';
	}*/

	if (e.type === 'mousedown' && e.sourceCapabilities?.firesTouchEvents) {
		return;
	}

	const rippleWrap = document.createElement('div');
	rippleWrap.classList.add('ripple-wrap');
	rippleWrap.classList.add(css.rippleWrap);
	const blur = Math.min(Math.max(target.offsetWidth, target.offsetHeight) / 15, 12);
	rippleWrap.style.setProperty('--ripple-blur', blur + 'px');

	const ripple = document.createElement('span');
	ripple.classList.add(css.ripple);

	const rect = target.getBoundingClientRect();
	const diagonal = Math.sqrt(rect.width ** 2 + rect.height ** 2);
	const clientX = e.clientX ?? e.touches[0].clientX;
	const clientY = e.clientY ?? e.touches[0].clientY;
	let ox = clientX - rect.left;
	let oy = clientY - rect.top;
	if (options.center) {
		ox = rect.width / 2;
		oy = rect.height / 2;
	}
	const maxd = Math.ceil(2 * Math.sqrt(Math.max(ox ** 2 + oy ** 2, (rect.width - ox) ** 2 + oy ** 2, (rect.width - ox) ** 2 + (rect.height - oy) ** 2, ox ** 2 + (rect.height - oy) ** 2)));
	ripple.style.width = '0px';
	ripple.style.height = '0px';
	ripple.style.left = ox + 'px';
	ripple.style.top = oy + 'px';
	if (options.invert) {
		ripple.style.filter = 'invert(1)';
	}
	rippleWrap.appendChild(ripple);
	target.appendChild(rippleWrap);

	let d = 0;
	let speed = 0.75 * (diagonal / 200); // 0.75px per 200px
	let opacity = 1;
	let status = 'hold';

	const onMouseUp = (e) => {
		speed = 1.2 * (diagonal / 200);
		status = 'release';
		document.removeEventListener('mouseup', onMouseUp);
		document.removeEventListener('mouseout', onMouseUp);
	}
	document.addEventListener('mouseup', onMouseUp);
	document.addEventListener('mouseout', onMouseUp);

	let animation = null;

	let lastTime = null;
	const frame = (time) => {
		const delta = time - (lastTime ?? time);
		lastTime = time;
		d += speed * delta;
		ripple.style.width = d + 'px';
		ripple.style.height = d + 'px';
		if ((status === 'release' && d >= maxd * 0.7) || (status === 'hold' && d >= maxd * 0.9)) {
			opacity -= 0.005 * delta;
			ripple.style.opacity = Math.max(opacity, 0);
			if (opacity <= 0) {
				cancelAnimationFrame(animation);
				document.removeEventListener('mouseup', onMouseUp);
				document.removeEventListener('mouseout', onMouseUp);
				rippleWrap.remove();
				return;
			}
		}
		animation = requestAnimationFrame(frame);
	}
	animation = requestAnimationFrame(frame);
}

export function useRipple(ref = null, options = {}) {
	const containerRef = ref ?? useRef(null);

	const onMouseDown = (e) => {
		//console.log(e.target);
		if (e.button >= 3) return;
		if (e.target.closest('[ripple]') !== containerRef.current) return;
		if (!containerRef.current.hasAttribute('ripple-touching')) {
			addRipple(e, containerRef.current, options);
		}
		containerRef.current.removeAttribute('ripple-touching');
	}
	const touchStart = (e) => {
		if (e.target.closest('[ripple]') !== containerRef.current) return;
		containerRef.current.setAttribute('ripple-touching', '');
		addRipple(e, containerRef.current, options);
	}


	useEffect(() => {
		if (!containerRef.current) return;
		containerRef.current.addEventListener('mousedown', onMouseDown);
		containerRef.current.addEventListener('touchstart', touchStart);
		containerRef.current.setAttribute('ripple', '');
		return () => {
			if (!containerRef.current) return;
			containerRef.current.removeEventListener('mousedown', onMouseDown);
			containerRef.current.removeEventListener('touchstart', touchStart);
			containerRef.current.removeAttribute('ripple');
		}
	}, []);

	return containerRef;
}

