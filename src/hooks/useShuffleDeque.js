import { useRef } from 'react';
import { shuffle } from '../utils.js'

function useShuffleDeque(initList, initDeque) {
	const currentIndexRef = useRef(initDeque.length ? 0 : -1);
	const dequeRef = useRef(initDeque);
	const list = useRef(initList);
	
	const setList = (newList, initDeque = []) => {
		list.current = newList;
		dequeRef.current = initDeque;
		if (initDeque.length) {
			currentIndexRef.current = 0;
		} else {
			currentIndexRef.current = -1;
		}
	}
	const next = () => {
		if (list.current.length === 0) {
			return null;
		}
		console.log(currentIndexRef.current, currentIndexRef.current + 1, JSON.parse(JSON.stringify(dequeRef.current)));
		currentIndexRef.current++;
		if (currentIndexRef.current >= dequeRef.current.length) {
			const append = shuffle(list.current);
			if (dequeRef.current.length && append[0] === dequeRef.current[dequeRef.current.length - 1]) {
				append.reverse();
			}
			dequeRef.current = dequeRef.current.concat(append);
			console.log(JSON.parse(JSON.stringify(dequeRef.current)), dequeRef.current[currentIndexRef.current]);
		}
		return dequeRef.current[currentIndexRef.current];
	}
	const prev = () => {
		if (list.current.length === 0) {
			return null;
		}
		currentIndexRef.current--;
		if (currentIndexRef.current < 0) {
			currentIndexRef.current += list.current.length;
			const prepend = shuffle(list.current);
			if (dequeRef.current.length &&prepend[prepend.length - 1] === dequeRef.current[0]) {
				prepend.reverse();
			}
			dequeRef.current = prepend.concat(dequeRef.current);
		}
		return dequeRef.current[currentIndexRef.current];
	}
	return [prev, next, setList];
}

export default useShuffleDeque;