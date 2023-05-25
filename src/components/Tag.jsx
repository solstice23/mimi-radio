import classNames from 'classnames';
import { useRipple } from './Ripple.jsx';
import css from './Tag.module.scss';

function Tag(props) {
	return (
		<div
			className={classNames(
				css.tag,
				props.className
			)}>
			{props.children}
		</div>
	)
}

export default Tag;