import css from './TopAppBar.module.scss'
import useScrolled from '../hooks/useScrolled.js';
import classNames from 'classnames';
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import getCloestScrollableParent from '../utils/getCloestScrollableParent.js';
import getInViewPosition from '../utils/getInViewPosition.js';

const TopAppBar = forwardRef(function({
	leftButtons = null,
	rightButtons = null,
	type = 'small',
	scrolled = null,
	children
}, ref) {
	if (!ref) {
		ref = useRef(null);
	}

	const topTitleRef = useRef(null);
	const bigTitleRef = useRef(null);
	const animationRef = useRef(null);

	const autoScrolled = useScrolled();
	const currentScrolled = scrolled != null ? scrolled : autoScrolled;


	useLayoutEffect(() => {
		if (type !== 'medium' && type !== 'large') {
			if (animationRef.current) {
				animationRef.current.currentTime = 1000;
				animationRef.current.pause();
				animationRef.current = null;
			}
			return;
		}
		const topTitle = topTitleRef.current;
		animationRef.current = topTitle.animate([
			{
				opacity: 0,
			},
			{
				opacity: 1,
			}
		], {
			duration: 1000,
			fill: 'forwards',
		});
		animationRef.current.pause();
	}, [type]);

	useLayoutEffect(() => {
		const parent = getCloestScrollableParent(ref.current);
		const bigText = bigTitleRef.current;
		const onScroll = () => {
			if (!animationRef.current) {
				return;
			}
			const bigTextTop = getInViewPosition(bigText, parent).top - 64;
			const bigTextHeight = bigText.offsetHeight;
			const percentInView = Math.min(Math.max(0, (bigTextHeight + bigTextTop) / bigTextHeight), 1);
			animationRef.current.currentTime = 1000 * (1 - percentInView);
		};
		parent.addEventListener('scroll', onScroll);
		window.addEventListener('scroll', onScroll);
		window.addEventListener('resize', onScroll);
		onScroll();
		return () => {
			parent.removeEventListener('scroll', onScroll);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, [type]);

	return (
		<>
			<div className={classNames(
					'topAppBar',
					css.topAppBar,
					{
						[css.scrolled]: currentScrolled,
						[css.topAppBarSmall]: type === 'small',
						[css.topAppBarMedium]: type === 'medium',
						[css.topAppBarLarge]: type === 'large',
						[css.topAppBarCenter]: type === 'center',
					}
				)}
				ref={ref}
			>
				{
					leftButtons && 
					<div className={css.leftButtons}>
						{
							leftButtons
						}
					</div>
				}
				<div className={css.title} ref={topTitleRef}>
					{children}
				</div>
				{
					rightButtons &&
					<div className={css.rightButtons}>
						{
							rightButtons
						}
					</div>
				}
			</div>
			{
				(type === 'medium' || type === 'large') &&
				<div className={classNames(
						'topAppBarHeadline',
						css.topAppBarHeadline,
						{
							[css.scrolled]: currentScrolled,
							[css.topAppBarHeadlineMedium]: type === 'medium',
							[css.topAppBarHeadlineLarge]: type === 'large',
						}
					)}
				>
					<span ref={bigTitleRef}>{children}</span>
				</div>
			}
		</>
	)
});
export default TopAppBar;