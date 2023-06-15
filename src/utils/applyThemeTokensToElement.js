const applyThemeTokensToElement = (cssTokens, element = null) => {
	if (!element) element = document.documentElement;
	cssTokens.forEach(({token, rgb: [r, g, b]}) => {
		document.documentElement.style.setProperty(token, `rgb(${r}, ${g}, ${b})`);
		document.documentElement.style.setProperty(`${token}-rgb`, `${r}, ${g}, ${b}`);
	});
}

export default applyThemeTokensToElement