import classNames from 'classnames';
import { useRipple } from './Ripple.jsx';
import css from './Button.module.scss';
import { forwardRef, useRef } from 'react';

const Button = forwardRef(function Button(props, ref) {
	if (!ref) ref = useRef(null);
	useRipple(ref);

	return (
		<button ref={ref} role="button" tabIndex={props.disabled ? -1 : (props.tabIndex ?? 0)}
			className={classNames(
				'button',
				css.Button,
				props.className,
				{
					[css.elevated]: (props.type ?? 'elevated') === 'elevated',
					[css.filled]: (props.type ?? 'elevated') === 'filled',
					[css.tonal]: (props.type ?? 'elevated') === 'tonal',
					[css.outlined]: (props.type ?? 'elevated') === 'outlined',
					[css.text]: (props.type ?? 'elevated') === 'text',
				},
				{
					[css.disabled]: props.disabled
				}
			)}
			title={props.title}
			onClick={props.onClick}
		>
			{
				props.icon &&
				<div className={css.icon}>
					{props.icon}
				</div>
			}
			{props.children}
		</button>
	)
});

export default Button;