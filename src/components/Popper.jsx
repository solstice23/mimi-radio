import classNames from 'classnames';
import css from './Popper.module.scss';
import { forwardRef, useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const getRelativePosition = (element, parentElement, fixed) => {
	const parentElementRect = parentElement.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();

	if (fixed) {
		return {
			top: elementRect.top,
			left: elementRect.left
		}
	}

	return {
		top: elementRect.top - parentElementRect.top + parentElement.scrollTop,
		left: elementRect.left - parentElementRect.left + parentElement.scrollLeft
	}
}
const getAnchorPoint = (anchorElement, parentElement, fixed, anchorPositionX, anchorPositionY) => {
	const relativePosition = getRelativePosition(anchorElement, parentElement, fixed);
	const [anchorElementX, anchorElementY] = [relativePosition.left, relativePosition.top];
	const [anchorElementW, anchorElementH] = [anchorElement.offsetWidth, anchorElement.offsetHeight];

	const scaleX = {
		left: 0,
		center: 0.5,
		right: 1
	}, scaleY = {
		top: 1,
		center: 0.5,
		bottom: 0
	};

	return {
		x: anchorElementX + anchorElementW * scaleX[anchorPositionX],
		y: anchorElementY + anchorElementH * scaleY[anchorPositionY]
	}
}
const checkAvailableSpace = (anchorElement, parentElement, fixed, sizeW, sizeH, anchorPositionX, anchorPositionY) => {
	const {x, y} = getAnchorPoint(anchorElement, parentElement, fixed, anchorPositionX, anchorPositionY);
	const [w, h] = fixed ? [window.innerWidth, window.innerHeight] : [parentElement.offsetWidth, parentElement.offsetHeight];
	const scaleX = {
		left: [0, 1],
		center: [0.5, 0.5],
		right: [1, 0]
	}, scaleY = {
		top: [0, 1],
		center: [0.5, 0.5],
		bottom: [1, 0]
	};

	const [x1, x2] = [x - sizeW * scaleX[anchorPositionX][0], x + sizeW * scaleX[anchorPositionX][1]];
	const [y1, y2] = [y - sizeH * scaleY[anchorPositionY][0], y + sizeH * scaleY[anchorPositionY][1]];

	return {
		x: x1 >= 0 && x2 <= w,
		y: y1 >= 0 && y2 <= h
	}
}
const getRevisedPosition = (anchorElement, parentElement, fixed, sizeW, sizeH, anchorPositionX, anchorPositionY) => {
	const XList = [anchorPositionX];
	if (anchorPositionX === 'left') { XList.push('right'); }
	else if (anchorPositionX === 'right') { XList.push('left'); }
	else { XList.push('left', 'right'); }

	const YList = [anchorPositionY];
	if (anchorPositionY === 'top') { YList.push('bottom'); }
	else if (anchorPositionY === 'bottom') { YList.push('top'); }
	else { YList.push('top', 'bottom'); }

	let availableAnchorPositionX = null;
	for (let x of XList) {
		availableAnchorPositionX = x;
		if (checkAvailableSpace(anchorElement, parentElement, fixed, sizeW, sizeH, x, anchorPositionY).x) { break; }
	}
	let availableAnchorPositionY = null;
	for (let y of YList) {
		availableAnchorPositionY = y;
		if (checkAvailableSpace(anchorElement, parentElement, fixed, sizeW, sizeH, anchorPositionX, y).y) { break; }
	}

	return [availableAnchorPositionX, availableAnchorPositionY];
}


const Popper = forwardRef(function Popper(props, ref) {
	if (!ref) ref = useRef();

	const anchorElementRef = useRef(null);
	anchorElementRef.current = props?.anchorElement ?? document.body;
	const parentElement = props?.parentElement ?? document.body;
	const fixed = props?.fixed ?? false;

	const [revisedAnchorPosition, setRevisedAnchorPosition] = useState(props.anchorPosition);

	const recalcPosition = () => {
		const container = ref.current;
		const [sizeW, sizeH] = [container.offsetWidth, container.offsetHeight];

		let [anchorPositionX, anchorPositionY] = ((props.anchorPosition ?? 'center') + ' center').split(' ');
		[anchorPositionX, anchorPositionY] = getRevisedPosition(anchorElementRef.current, parentElement, fixed, sizeW, sizeH, anchorPositionX, anchorPositionY);

		container.style.left = container.style.right = container.style.top = container.style.bottom = null;

		const {x, y} = getAnchorPoint(anchorElementRef.current, parentElement, fixed, anchorPositionX, anchorPositionY);
		if (anchorPositionX == 'left') { container.style.left = x + 'px'; }
		else if (anchorPositionX == 'right') { container.style.right = (parentElement.offsetWidth - x) + 'px'; }
		else { container.style.left = (x - sizeW / 2) + 'px'; }
		if (anchorPositionY == 'top') { container.style.top = y + 'px'; }
		else if (anchorPositionY == 'bottom') { container.style.bottom = (parentElement.offsetHeight - y) + 'px'; }
		else { container.style.top = (y - sizeH / 2) + 'px'; }

		setRevisedAnchorPosition(`${anchorPositionX} ${anchorPositionY}`);
	}

	useLayoutEffect(() => {
		recalcPosition();
	}, [props.anchorPosition, props.anchorElement, props.parentElement, props.noClick, props.state]);

	useEffect(() => {
		window.addEventListener('resize', recalcPosition);
		return () => {
			window.removeEventListener('resize', recalcPosition);
		}
	}, []);

	return (
		createPortal(
			<div
				ref={ref}
				className={classNames(
					css.popper,
					props.className,
					{
						[css.noClick]: props.noClick,
						[css.fixed]: props.fixed,
					}
				)}
				style={{
					'--anchor-position': revisedAnchorPosition,
					'--anchor-element-width': `${anchorElementRef.current?.offsetWidth}px`,
					'--anchor-element-height': `${anchorElementRef.current?.offsetHeight}px`,
					'--z-index': props.zIndex ?? 10,
					...(props.style ?? {}),
				}}
			>
				{props.children}
			</div>
		, parentElement)
	)
});

export default Popper;