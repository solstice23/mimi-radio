import classNames from 'classnames';
import css from './Icon.module.scss';

function Icon(props) {
	return (
		<i className={classNames('icon', props.className)}>
			{props.children}
		</i>
	)
}

export default Icon;