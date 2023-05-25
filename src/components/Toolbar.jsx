import css from './Toolbar.module.scss'

function Toolbar(props) {
	return (
		<div className={css.toolbar}>
			<div className={css.title}>
				{props.title}
			</div>
		</div>
	)
}
export default Toolbar;