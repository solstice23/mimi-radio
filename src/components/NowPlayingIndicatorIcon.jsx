import classNames from 'classnames';
import css from './NowPlayingIndicatorIcon.module.scss';

function NowPlayingIndicatorIcon(props) {
	return (
		<i className={
			classNames(
				css.nowPlayingIndicatorIcon,
				{
					[css.paused]: props.paused,
				}
			)
		}>
			<span></span>
			<span></span>
			<span></span>
		</i>
	)
}

export default NowPlayingIndicatorIcon;