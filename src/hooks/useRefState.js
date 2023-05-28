import { useState, useRef, useEffect } from 'react';
const useRefState = (initialState) => {
	let [state, _setState] = useState(initialState);
	const stateRef = useRef(state);
	const setState = (data) => {
		stateRef.current = data;
		_setState(data);
	};
	return [state, stateRef, setState];
}
export default useRefState;