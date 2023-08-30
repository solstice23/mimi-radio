import classNames from 'classnames';
import css from './Radio.module.scss';
import { useEffect, useState, useId, useContext } from 'react';
import { useRipple } from './Ripple.jsx';
import RadioGroupContext from '../contexts/RadioGroupContext.tsx';


function Radio(props) {
	if (useContext(RadioGroupContext) === null) {
		throw new Error('Radio must be a child of RadioGroup');
	}

	const {currentValue, setValue, onChange} = useContext(RadioGroupContext);

	const circleContainerRef = useRipple(null, { center: true });

	const id = props.value ? props.value : useId();

	const onClick = e => {
		setValue(id);
		props?.onSelected?.();
	}

	const currentSelected = currentValue === id;

	return (
		<div className={classNames(
			css.radio,
			props.className,
			{
				[css.disabled]: props.disabled,
			}
		)}>
			<div
				className={classNames(
					css.circleContainer,
					{
						[css.selected]: currentSelected
					}
				)}
				ref={circleContainerRef}
				onClick={onClick}
			>
				<div className={classNames(
					css.circle,
					{
						[css.selected]: currentSelected
					}
				)}></div>
			</div>
			{
				props.label && <label className={css.label} onClick={onClick}>{props.label}</label>
			}
		</div>

	)
}

export default Radio;