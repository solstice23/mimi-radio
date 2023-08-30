import classNames from 'classnames';
import css from './TextField.module.scss';
import { forwardRef, useState, useEffect, useLayoutEffect, useRef } from 'react';

const TextField = forwardRef(function TextField(props, ref) {
	if (ref === null) ref = useRef();

	const [value, setValue] = useState((props.value !== undefined ? props.value : props.defaultValue) ?? '');

	const currentValue = props.value !== undefined ? props.value : value;

	const label = props.label?.trim() ?? '';

	const placeholder = props.placeholder?.length ? props.placeholder : ' ';
	return (
		<div
			className={classNames(
				css.textField,
				'text-field',
				props.className,
				{
					[css.outlined]: (props.type ?? 'outlined') === 'outlined',
					[css.filled]: (props.type ?? 'outlined') === 'filled',

					[css.noLabel]: label === '',
					[css.withLeadingIcon]: props.leadingIcon,
					[css.disabled]: props.disabled
				}
			)}
		>
			<input
				ref={ref}
				type="text"
				className={classNames(
					css.input,
				)}
				placeholder={placeholder}
				value={currentValue}
				onChange={() => {
					setValue(ref.current.value);
					props?.onChange?.(ref.current.value);
				}}
				onFocus={props.onFocus}
				onBlur={props.onBlur}
				readOnly={props.readOnly}
				disabled={props.disabled}
			/>
			<TextFieldLabel
				label={label}
			/>
			{
				props.leadingIcon &&
				<div className={css.leadingIcon}>
					{props.leadingIcon}
				</div>
			}
		</div>
	)
});

export function TextFieldLabel({label}) {
	const labelTestRef = useRef(null);
	const [labelWidth, setLabelWidth] = useState(0);

	useLayoutEffect(() => {
		setLabelWidth(labelTestRef.current.offsetWidth);
	}, [label]);
	
	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			setLabelWidth(labelTestRef.current.offsetWidth);
		});
		resizeObserver.observe(labelTestRef.current);
		return () => resizeObserver.disconnect();	
	}, []);

	return (
		<>
			<span
				className={classNames(
					css.label,
				)}
				style={{
					'--label-width': labelWidth + 'px',
				}}
			>			
				<span>{label}</span>
			</span>
			<span ref={labelTestRef} className={css.labelSizeTest}>{label}</span>
		</>
	);
}

export default TextField;