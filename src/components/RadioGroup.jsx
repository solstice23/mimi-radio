import { useEffect, useState } from 'react';
import RadioGroupContext from '../contexts/RadioGroupContext.tsx';


function RadioGroup(props) {
	const [value, setValue] = useState(props.value !== undefined ? props.value : props.defaultValue);

	useEffect(() => {
		props.onChange?.(value);
	}, [value]);

	return (
		<RadioGroupContext.Provider value={{
			currentValue: props.value !== undefined ? props.value : value,
			setValue: setValue
		}}>
			{props.children}
		</RadioGroupContext.Provider>
	)
}

export default RadioGroup;