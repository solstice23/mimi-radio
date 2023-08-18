import classNames from 'classnames';
import { useRipple } from './Ripple.jsx';
import css from './Card.module.scss';

function Card(props) {
	const container = useRipple();

	return (
		<div ref={container}
			className={classNames(
				css.card,
				props.className,
				{
					[css.elevated]: (props.type ?? 'filled') === 'elevated',
					[css.filled]: (props.type ?? 'filled') === 'filled',
					[css.outlined]: (props.type ?? 'filled') === 'outlined',
				},
				{
					[css.noRipple]: props.ripple === false,
					[css.noLayer]: props.layer === false,
				}
			)}
			onClick={props.onClick}
			onDoubleClick={props.onDoubleClick}
			onContextMenu={props.onContextMenu}
			hash={props.hash}
		>
			{props.children}
		</div>
	)
}

export default Card;