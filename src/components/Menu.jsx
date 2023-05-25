import classNames from 'classnames';
import Popper from './Popper.jsx';
import css from './Menu.module.scss';
import { useEffect, useRef } from 'react';

function Menu(props) {
	const ref = useRef();
	return (
		<Popper
			anchorElement={props.anchorElement}
			anchorPosition={props.anchorPosition ?? 'left top'}
			noClick={!(props.open ?? true)}
			ref={ref}
		>
			<div className={classNames(
				css.menu,
				props.className,
				{
					[css.hide]: !(props.open ?? true)
				}
			)}>
				{props.children}
			</div>
		</Popper>
	)
}

export default Menu;