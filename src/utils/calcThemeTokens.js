import { Hct } from "@material/material-color-utilities";

const mdTokens = [
//	['token', 'palette', 'light_tone', 'dark_tone'],
	['primary', 'primary', 40, 80],
	['primary-container', 'primary', 90, 30],
	['on-primary', 'primary', 100, 20],
	['on-primary-container', 'primary', 10, 90],
	['inverse-primary', 'primary', 80, 40],
	['secondary', 'secondary', 40, 80],
	['secondary-container', 'secondary', 90, 30],
	['on-secondary', 'secondary', 100, 20],
	['on-secondary-container', 'secondary', 10, 90],
	['tertiary', 'tertiary', 40, 80],
	['tertiary-container', 'tertiary', 90, 30],
	['on-tertiary', 'tertiary', 100, 20],
	['on-tertiary-container', 'tertiary', 10, 90],
	['surface', 'neutral', 98, 6],
	['surface-dim', 'neutral', 87, 6],
	['surface-bright', 'neutral', 98, 24],
	['surface-container-lowest', 'neutral', 100, 4],
	['surface-container-low', 'neutral', 96, 10],
	['surface-container', 'neutral', 94, 12],
	['surface-container-high', 'neutral', 92, 17],
	['surface-container-highest', 'neutral', 90, 22],
	['surface-variant', 'neutralVariant', 90, 30],
	['on-surface', 'neutral', 10, 90],
	['on-surface-variant', 'neutralVariant', 30, 80],
	['inverse-surface', 'neutral', 20, 90],
	['inverse-on-surface', 'neutral', 95, 20],
	['background', 'neutral', 98, 6],
	['on-background', 'neutral', 10, 90],
	['error', 'error', 40, 80],
	['error-container', 'error', 90, 30],
	['on-error', 'error', 100, 20],
	['on-error-container', 'error', 10, 90],
	['outline', 'neutralVariant', 50, 60],
	['outline-variant', 'neutralVariant', 80, 30],
	['shadow', 'neutral', 0, 0, true],
	['surface-tint-color', 'primary', 40, 80],
	['scrim', 'neutral', 0, 0]
]
const intToRGB = (int) => [int >> 24 & 0xFF, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF];
function calcThemeTokens(theme, dark = false) {
	return mdTokens.map(([token, palette, lightTone, DarkTone, rgbVariable = false]) => {
		const {hue, chroma} = theme.palettes[palette];
		const tone = dark ? DarkTone : lightTone;
		const int = Hct.from(hue, chroma, tone).toInt();
		const [a, r, g, b] = intToRGB(int);
		return {
			token: `--md-sys-color-${token}`,
			rgb: [r, g, b],
		};
	}).concat(...theme?.customColors?.map((item) => {
		const tmp = [];
		const dict = item[dark ? 'dark' : 'light'];
		for (const key in dict) {
			const [a, r, g, b] = intToRGB(dict[key]);
			tmp.push({
				token: `--md-custom-color-${item.color.name}-${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`,
				rgb: [r, g, b]
			});
		}
		return tmp;
	}) ?? []);
}

export default calcThemeTokens;