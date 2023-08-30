import classNames from 'classnames';
import { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button.jsx';
import css from './Dialog.module.scss';

const Dialog = forwardRef(function Dialog(props, ref) {
	if (ref === null) ref = useRef();

	const parentElement = props?.parentElement ?? document.body;

	const open = props.open ?? false;

	const hasButton = props.positiveButton || props.negativeButton || props.neutralButton;

	useEffect(() => {
		if ((props?.closeOnEsc ?? true) && open) {
			const listener = (e) => {
				if (e.key === 'Escape') {
					props.onClose?.();
				}
			};
			document.addEventListener('keydown', listener);
			return () => {
				document.removeEventListener('keydown', listener);
			}
		}
	}, [props.closeOnEsc, props.open]);

	return (
		createPortal(
			<div ref={ref}
				className={classNames(
					css.dialogScrim,
					props.className,
					{
						[css.hide]: !open,
						[css.animation]: props.animation ?? true,
					}
				)}
				onClick={(e) => {
					if (!props.closeOnClickOutside) return;
					if (e.target === ref.current) {
						props.onClose?.();
					}
				}}
				style={{
					'zIndex': props.zIndex ?? 1000,
				}}
			>
				<div
					className={
						classNames(
							css.dialog,
							'dialog'
						)
					}
					ref={props?.innerRef}
				>
					{
						props.icon && <div className={css.icon}>
							{props.icon}
						</div>
					}
					{
						props.title && <div className={css.title}>
							{props.title}
						</div>
					}
					<div className={css.content}>
						{props.children}
					</div>
					{
						hasButton && <div className={css.buttons}>
							{
								props.neutralButton &&
									<Button type="text"	onClick={props?.onNeutralButtonClick}>{props.neutralButton}</Button>
							}
							<div className={css.spacer} />
							{
								props.negativeButton &&
									<Button type="text"	onClick={props?.onNegativeButtonClick}>{props.negativeButton}</Button>
							}
							{
								props.positiveButton &&
									<Button type="text"	onClick={props?.onPositiveButtonClick}>{props.positiveButton}</Button>
							}
						</div>
					}
				</div>
				{
					open && <style>
						{
							`html, body {
								overflow: hidden;
							}`
						}
					</style>
				}
			</div>
		, parentElement)
	)
});

export default Dialog;