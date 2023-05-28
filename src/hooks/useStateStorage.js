import { useState, useEffect } from 'react';
const useStateStorage = (defaultState, key) => {
	const [state, setState] = useState(() => {
		const storageState = localStorage.getItem(key);
		return storageState ? JSON.parse(storageState) : defaultState;
	});
	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(state));
	}, [state]);
	return [state, setState];
}
export default useStateStorage;