import { useState, useRef, useEffect } from 'react';
const useRefStateStorage = (defaultState) => {
	const [state, setState] = useState(() => {
		const storageState = localStorage.getItem('state');
		return storageState ? JSON.parse(storageState) : defaultState;
	});
	const stateRef = useRef(state);
	useEffect(() => {
		stateRef.current = state;
		localStorage.setItem('state', JSON.stringify(stateRef.current));
	}, [state]);
	return [state, stateRef, setState];
}
export default useRefStateStorage;