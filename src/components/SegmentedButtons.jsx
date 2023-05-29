import { useEffect, useReducer, forwardRef } from 'react';
import { useRipple } from './Ripple.jsx';
import Icon from './Icon.jsx';
import css from './SegmentedButtons.module.scss';
import classNames from 'classnames';
import { MdCheck } from 'react-icons/md';

const SegmentedButtons = forwardRef(
	function SegmentedButtons(props, ref) {
		const [selected, dispatchSelected] = useReducer((state, action) => {
			switch (action.type) {
				case 'select':
					if (!props.multiple) {
						return action.value;
					}
					return props.buttons.filter((button) => button.value === action.value || state.includes(button.value)).map((button) => button.value);
				case 'deselect':
					if (!props.multiple) {
						return state;
					}
					if (!(props.canEmpty ?? true) && state.length === 1) {
						return state;
					}
					return state.filter((value) => value !== action.value);
				default:
					return state;
			}
		}, props.buttons.filter((button) => button.selected).map((button) => button.value));

		useEffect(() => {
			if (props.setSelected) {
				props.setSelected(selected);
			}
		}, [selected]);


		return (
			<div
				className={
					classNames(css.segmentedButtons, props.className)
				}
				ref={ref}
			>
				{props.buttons.map((button, index) => (
					<SegmentedButton
						key={button.value}
						label={button.label}
						value={button.value}
						icon={button.icon}
						selected={(button.selected !== 'undefined') ? button.selected : selected.includes(button.value)}
						dispatchSelected={dispatchSelected}
					/>
				))}
			</div>
		)
	}
);

function SegmentedButton(props) {
	const container = useRipple();

	return (
		<button
			ref={container}
			className={classNames(css.segmentedButton, {
				[css.selected]: props.selected,
			})}
			onClick={() => 
				props.selected ?
					props.dispatchSelected({type: 'deselect', value: props.value}) :
					props.dispatchSelected({type: 'select', value: props.value})
			}
		>
			<Icon className={classNames(css.icon, css.iconCheck)}>
				<MdCheck />
			</Icon>
			{
				props.icon && <Icon className={classNames(css.icon, css.iconCustom)}>
					{props.icon}
				</Icon>
			}
			<div className={css.label}>
				{props.label}
			</div>
		</button>
	)
}

export default SegmentedButtons;