import { useState, useRef, useEffect } from 'react';
const useRefStateStorage = (defaultState, key) => {
	const [state, setState] = useState(() => {
		const storageState = localStorage.getItem(key);
		return storageState ? JSON.parse(storageState) : defaultState;
	});
	const stateRef = useRef(state);
	useEffect(() => {
		stateRef.current = state;
		localStorage.setItem(key, JSON.stringify(stateRef.current));
	}, [state]);
	return [state, stateRef, setState];
}
export default useRefStateStorage;