import { useSyncExternalStore } from 'react';

function useScrolled(parent = document.documentElement) {
	const scrolled = useSyncExternalStore(subscribe(parent), getSnapshot(parent));
	return scrolled;
}

function subscribe(parent) {
	return (callback) => {
		window.addEventListener('scroll', callback);
		parent.addEventListener('scroll', callback);
		window.addEventListener('resize', callback);
		return () => {
			parent.removeEventListener('scroll', callback);
			window.removeEventListener('scroll', callback);
			window.removeEventListener('resize', callback);
		};
	}
}

function getSnapshot(parent) {
	return () => {
		return parent.scrollTop > 0;
	}
}

export default useScrolled;