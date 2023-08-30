import { useRef, useState, useLayoutEffect } from 'react';
function useAsyncCachedFetch(url) {
	if (url === undefined || url === '') {
		url = null;
	}

	const currentUrlRef = useRef(null);

	if (!window.fetchCache) {
		window.fetchCache = {
			null: {
				status: 'fetched',
				content: null
			}
		};
	}

	const [content, setContent] = useState(null);
	const [status, setStatus] = useState('fetched'); // 'pending' | 'fetched' | 'error'

	useLayoutEffect(() => {
		currentUrlRef.current = url;
	}, [url]);

	useLayoutEffect(() => {
		if (window.fetchCache[url]?.status === 'fetched') {
			setContent(window.fetchCache[url].content);
			setStatus('fetched');
			return;
		} else if (window.fetchCache[url]?.status === 'pending') {
			const listener = (e) => {
				//console.log("received", e.detail.url, currentUrlRef.current);
				if (e.detail.url === currentUrlRef.current) {
					setContent(window.fetchCache[url].content);
					setStatus('fetched');
					//console.log('fetchCacheReady', e.detail.url);
					window.removeEventListener('fetchCacheReady', listener);
				}
			}
			setStatus('pending');
			//console.log('asdf', url);
			window.addEventListener('fetchCacheReady', listener);
			return;
		}
		async function load() {
			window.fetchCache[url] = {
				status: 'pending',
				content: null
			}
			const result = await fetch(url).then(res => res.json()).catch(err => {
				window.fetchCache[url].status = 'error';
				window.fetchCache[url].content = null;
				window.fetchCache[url].error = err;
				setContent(null);
				setStatus('error');
				return null;
			});
			window.fetchCache[url].content = result;
			window.fetchCache[url].status = 'fetched';
			if (currentUrlRef.current === url) {
				setContent(result);
				setStatus('fetched');
			}
			//console.log('111111111', url);
			window.dispatchEvent(new CustomEvent('fetchCacheReady', { detail: { url } }));
		}
		setStatus('pending');
		//console.log('qwer', url);
		load();
	}, [url]);

	return [content, status];
}

export default useAsyncCachedFetch;