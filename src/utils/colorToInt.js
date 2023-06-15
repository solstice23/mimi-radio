import { argbFromHex } from '@material/material-color-utilities';

function colorToInt(color) {
	if (typeof color === 'string') {
		return argbFromHex(color);
	} else if (typeof color === 'number') {
		return color;
	} else {
		throw new Error('Invalid color type');
	}
}

export default colorToInt;