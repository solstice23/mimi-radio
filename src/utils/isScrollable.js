function isScrollable(element) {
	const computedStyle = window.getComputedStyle(element);
	return computedStyle.overflowY === 'auto' || computedStyle.overflowY === 'scroll';
}

export default isScrollable;