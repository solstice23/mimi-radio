function getInViewPosition(element, parentElement) {
	const parentElementRect = (parentElement === document.documentElement) ? {
		top: 0,
		left: 0
	} : parentElement.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();

	return {
		top: elementRect.top - parentElementRect.top,
		left: elementRect.left - parentElementRect.left
	}
}

export default getInViewPosition;