import classNames from 'classnames';
import { forwardRef, useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useRipple } from './Ripple.jsx';
import css from './Tabs.module.scss';

const Tabs = forwardRef(function Tabs(props, ref) {
	if (ref === null) ref = useRef();

	const [currentTab, setCurrentTab] = useState(props?.currentTab ?? 0);

	useEffect(() => {
		if (props?.currentTab !== undefined) {
			setCurrentTab(props.currentTab);
		}
	}, [props.currentTab]);

	const tabsRef = useRef(null);
	const tabContentsRef = useRef(null);

	const calcHeight = () => {
		if (!(props?.dynamicHeight ?? true)) {
			tabContentsRef.current.style.height = '';
			return;
		}
		if (tabContentsRef.current === null) return;
		const currentTabContentDom = tabContentsRef.current.children[currentTab];
		const height = currentTabContentDom.getBoundingClientRect().height;
		tabContentsRef.current.style.height = height + 'px';
	};
	useLayoutEffect(() => {
		calcHeight();
		window.addEventListener('resize', calcHeight);
		const resizeObserver = new ResizeObserver(calcHeight);
		tabContentsRef.current?.children[currentTab] && resizeObserver.observe(tabContentsRef.current.children[currentTab]);
		return () => {
			window.removeEventListener('resize', calcHeight);
			resizeObserver.disconnect();
		}
	}, [currentTab, props.dynamicHeight]);

	useEffect(() => {
		if (!tabsRef.current) return;
		const currentTabDom = tabsRef.current.children[currentTab];
		const innerDom = currentTabDom.querySelector(`.${css.tabInner}`);
		const width = innerDom.getBoundingClientRect().width;
		ref.current.style.setProperty('--current-tab-inner-width', width + 'px');
	},[currentTab, props.children]);

	return (
		<div
			className={
				classNames(
					css.tabs,
					'tabs',
					props.className,
					{
						[css.primary]: (props.type ?? 'primary') === 'primary',
						[css.secondary]: (props.type ?? 'primary') === 'secondary',

						[css.withIcon]: props.children.some(child => child.props.icon),
						[css.dynamicHeight]: props.dynamicHeight ?? true,
					}
				)
			}
			style={{
				'--current-tab': currentTab,
				'--tabs-count': props.children.length
			}}
			ref={ref}
		>
			<div className={classNames(css.tabBar, 'tab-bar')} ref={tabsRef}>
				{
					props.children.map((child, i) => {
						return (
							<TabItem
								key={i}
								label={child.props.label}
								icon={child.props.icon}
								className={
									classNames(
										child.props.className,
										{
											[css.current]: currentTab === i
										}
									)
								}
								onClick={() => {
									setCurrentTab(i);
									props.onTabChange?.(i);
								}}
							/>
						)
					})
				}
				<div className={css.indicator}/>
			</div>
			<div className={css.tabContents} ref={tabContentsRef}>
				{
					props.children.map((child, i) => {
						return (
							<TabContentItem
								key={i}
								className={child.props.className}
								tabId={i}
							>
								{child.props.children}
							</TabContentItem>
						)
					})
				}
			</div>
		</div>
	)
});


export default Tabs;

const TabItem = function (props) {
	const ref = useRipple();
	return (
		<div
			className={
				classNames(
					css.tab,
					'tab',
					props.className,
				)
			}
			ref={ref}
			onClick={() => {
				props.onClick();
			}}
			style={{
				'--tab-id': props.tabId,
			}}
		>
			<div className={css.tabInner}>
				{
					props.icon &&
					<div className={css.tabIcon}>
						{props.icon}
					</div>
				}
				<div className={css.tabLabel}>
					{props.label}
				</div>
			</div>
		</div>
	);
}

const TabContentItem = function (props) {
	return (
		<div className={
			classNames(
				css.tabContent,
				'tab-content',
				props.className,
			)
		}
		style={{
			'--tab-id': props.tabId,
		}}>
			{props.children}
		</div>
	)
}