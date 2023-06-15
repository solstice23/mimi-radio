import isScrollable from './isScrollable.js';

function getCloestScrollableParent(element) {
	if (!element) {
		return null;
	}
	const parent = element.parentElement;
	if (parent === document.documentElement || isScrollable(parent)) {
		return parent;
	}
	return getCloestScrollableParent(parent);
}

export default getCloestScrollableParent;