import classNames from 'classnames';
import { TextFieldLabel } from './TextField.jsx';
import Menu from './Menu.jsx';
import MenuItem, {MenuDivider} from './MenuItem.jsx';
import cssTf from './TextField.module.scss';
import css from './Select.module.scss';
import { forwardRef, useState, useEffect, useLayoutEffect, useRef } from 'react';

const Select = forwardRef(function Select(props, ref) {
	if (ref === null) ref = useRef();

	const [value, setValue] = useState((props.value !== undefined ? props.value : props.defaultValue) ?? '');
	const [displayValue, setDisplayValue] = useState(
		props.options.find(option => 
			option.value === (props.value !== undefined ? props.value : props.defaultValue)
		)?.label?.trim()
		?? ''
	);

	const currentValue = props.value !== undefined ? props.value : value;

	const label = props.label?.trim() ?? '';

	const placeholder = props.placeholder?.length ? props.placeholder : ' ';

	const [active, setActive] = useState(false);
	const [minZIndex, setMinZIndex] = useState(10);

	const textFieldRef = useRef(null);
	const menuRef = useRef(null);

	
	const handleClickAway = (e) => {
		if (open && !menuRef.current.contains(e.target) && !textFieldRef.current.contains(e.target)) {
			setActive(false);
		}
	}
	useEffect(() => {
		document.addEventListener('click', handleClickAway);
		return () => {
			document.removeEventListener('click', handleClickAway);
		}
	}, [open]);

	return (
		<div
			className={classNames(
				cssTf.textField,
				css.select,
				'text-field',
				props.className,
				{
					[cssTf.outlined]: (props.type ?? 'outlined') === 'outlined',
					[cssTf.filled]: (props.type ?? 'outlined') === 'filled',
					[css.outlined]: (props.type ?? 'outlined') === 'outlined',
					[css.filled]: (props.type ?? 'outlined') === 'filled',

					[cssTf.active]: active,
					[css.active]: active,

					[cssTf.noLabel]: label === '',
					[css.noLabel]: label === '',
					[cssTf.withLeadingIcon]: props.leadingIcon,
					[cssTf.disabled]: props.disabled
				}
			)}
			ref={textFieldRef}
			onClick={() => {
				if (!active) {
					let min = 1000000000;
					let dom = textFieldRef.current;
					while (dom) {
						const zIndex = parseInt(getComputedStyle(dom).zIndex);
						if (zIndex && zIndex < min) {
							min = zIndex;
						}
						dom = dom.parentElement;
					}
					setMinZIndex(min + 1);
				}
				setActive(!active);
			}}
		>
			<input
				ref={ref}
				type="text"
				className={classNames(
					cssTf.input,
					css.input,
					{
						[cssTf.active]: active,
						[css.active]: active,
					}
				)}
				placeholder={placeholder}
				value={displayValue}
				onChange={() => {
					setValue(ref.current.value);
					props?.onChange?.(ref.current.value);
				}}
				readOnly={true}
				disabled={props.disabled}
			/>
			<TextFieldLabel
				label={label}
			/>
			{
				props.leadingIcon &&
				<div className={cssTf.leadingIcon}>
					{props.leadingIcon}
				</div>
			}
			<svg
				className={css.dropdownIcon}
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				width="24"
				viewBox="0 -960 960 960"
			>
				<path d="M480-360 280-560h400L480-360Z"/>
			</svg>
			<Menu
				ref={menuRef}
				className={classNames(
					css.menu,
				)}
				anchorElement={textFieldRef?.current}
				anchorPosition="center top"
				open={active}
				animation={true}
				fullWidth={true}
				zIndex={Math.max(props.zIndex ?? 10, minZIndex)}
			>
				{
					props.options.map((option, index) => {
						if (option === '-') return <MenuDivider key={index} />;
						return (
							<MenuItem
								key={index}
								selected={option.value === currentValue && option.label === displayValue}
								onClick={() => {
									setValue(option.value);
									setDisplayValue(option.label);
									props?.onChange?.(option.value);
									setActive(false);
								}}
							>
								{option.label}
							</MenuItem>
						)
					})
				}
			</Menu>
		</div>
	)
});

export default Select;