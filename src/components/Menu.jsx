import classNames from 'classnames';
import Popper from './Popper.jsx';
import css from './Menu.module.scss';
import { forwardRef, useEffect, useRef } from 'react';

const Menu = forwardRef(function Menu(props, ref) {
	if (ref === null) ref = useRef();
	return (
		<Popper
			anchorElement={props.anchorElement}
			anchorPosition={props.anchorPosition ?? 'left top'}
			relativeToElement={props.relativeToElement}
			fixed={props.fixed}
			noClick={!(props.open ?? true)}
			ref={ref}
		>
			<div 
				className={classNames(
					css.menu,
					props.className,
					{
						[css.hide]: !(props.open ?? true)
					}
				)}
				onClick={e => {
					e.stopPropagation();
					props.onClose?.();
				}}
			>
				{props.children}
			</div>
		</Popper>
	)
});

export default Menu;