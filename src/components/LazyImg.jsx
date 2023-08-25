import { forwardRef, useEffect, useRef, useState, useLayoutEffect } from 'react';
import blurHashMapRaw from '../../blurhash-map.json';
import camelcase from 'camelcase';
import { BlurhashCanvas } from "react-blurhash";
import classNames from 'classnames';
import css from './LazyImg.module.scss';

const blurHashMap = {};
for (const key in blurHashMapRaw) {
	blurHashMap[key.split('\\').pop()] = blurHashMapRaw[key].replace(/^"/, '').replace(/"$/, '');
}

const getSlug = (src) => {
	src = decodeURIComponent(src);
	// the behaviors of vite-plugin-blurhash are different in dev and prod
	if (import.meta.env.PROD) {
		src = src.replace(/\//g, '.');
	} else {
		src = src.split('/').pop();
	}
	src = camelcase(src);
	return src;
}


const LazyImg = forwardRef(function LazyImg(props, ref) {
	if (ref === null) ref = useRef();

	const containerRef = props.containerRef ?? useRef();

	const blurHash = props.blurHash ?? true;
	const src = props.src;
	const rawSrc = props.rawSrc;

	useLayoutEffect(() => {
		const img = ref.current;
		if (img.complete) {
			containerRef.current.classList.add(css.loaded);
		}
		img.onload = () => {
			containerRef.current.classList.add(css.loaded);
		}
	}, []);

	
	// if (!blurHashMap[getSlug(rawSrc)]) console.log(blurHashMap, getSlug(rawSrc));

	return <div
		className={classNames(
			css.lazyImg,
			props.className
		)}
		style={props.style}
		ref={containerRef}
	>
		<img
			ref={ref}
			loading="lazy"
			className={css.img}
			style={props.style}
			alt={props.alt}
			src={src}
			width={props.width}
			height={props.height}
		/>
		{
			blurHash && blurHashMap[getSlug(rawSrc)] &&
			<BlurhashCanvas
				hash={blurHashMap[getSlug(rawSrc)]}
				className={css.blurHash}
			/>
		}
	</div>
});

export default LazyImg;