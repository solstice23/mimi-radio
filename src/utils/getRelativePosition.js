function getRelativePosition(element, parentElement) {
	const parentElementRect = parentElement.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();

	return {
		top: elementRect.top - parentElementRect.top + parentElement.scrollTop,
		left: elementRect.left - parentElementRect.left + parentElement.scrollLeft
	}
}

export default getRelativePosition;