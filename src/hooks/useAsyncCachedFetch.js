import { useRef, useState, useLayoutEffect } from 'react';
function useAsyncCachedFetch(url) {
	if (url === undefined || url === '') {
		url = null;
	}

	const currentUrlRef = useRef(null);

	const cacheRef = useRef({
		null: {
			status: 'fetched',
			content: null
		}
	});

	const [content, setContent] = useState(null);
	const [status, setStatus] = useState('fetched'); // 'pending' | 'fetched' | 'error'

	useLayoutEffect(() => {
		currentUrlRef.current = url;
	}, [url]);

	useLayoutEffect(() => {
		if (cacheRef.current[url]?.status === 'fetched') {
			setContent(cacheRef.current[url].content);
			setStatus('fetched');
			return;
		} else if (cacheRef.current[url]?.status === 'pending') {
			setStatus('pending');
			return;
		}
		async function load() {
			cacheRef.current[url] = {
				status: 'pending',
				content: null
			}
			const result = await fetch(url).then(res => res.json()).catch(err => {
				cacheRef.current[url].status = 'error';
				cacheRef.current[url].content = null;
				cacheRef.current[url].error = err;
				setStatus('error');
				return null;
			});
			cacheRef.current[url].content = result;
			cacheRef.current[url].status = 'fetched';
			if (currentUrlRef.current === url) {
				setContent(result);
				setStatus('fetched');
			}
		}
		load();
	}, [url]);

	return [content, status];
}

export default useAsyncCachedFetch;