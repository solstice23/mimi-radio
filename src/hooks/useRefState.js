import { useState, useRef, useEffect } from 'react';
const useRefState = (initialState) => {
	const [state, setState] = useState(initialState);
	const stateRef = useRef(state);
	useEffect(() => {
		stateRef.current = state;
	}, [state]);
	return [state, stateRef, setState];
}
export default useRefState;