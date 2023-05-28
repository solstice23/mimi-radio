import classNames from 'classnames';
import css from './Checkbox.module.scss';
import { useEffect, useState } from 'react';
import { useRipple } from './Ripple.jsx';

function Checkbox(props) {
	const [checked, setChecked] = useState((props.checked !== undefined ? props.checked : props.defaultChecked) || false);

	const checkmarkContainerRef = useRipple(null, { center: true });

	const onClick = e => {
		setChecked(!checked);
		props.onChange?.(!checked);
	}

	const currentChecked = props.checked !== undefined ? props.checked : checked;

	return (
		<div className={classNames(
			css.checkbox,
			props.className
		)}>
			<div
				className={classNames(
					css.checkmarkContainer,
					{
						[css.checked]: currentChecked
					}
				)}
				ref={checkmarkContainerRef}
				onClick={onClick}
			>
				<svg
					className={classNames(
						css.checkmark,
						{
							[css.checked]: currentChecked
						}
					)}
					viewBox="0 0 100 100">
					<path
						d="M21.764,52.392l17.1,17.3L78.276,30.276"
					/>
				</svg>
			</div>
			{
				props.label && <label className={css.label} onClick={onClick}>{props.label}</label>
			}
		</div>

	)
}

export default Checkbox;