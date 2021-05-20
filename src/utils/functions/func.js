export const createName = (length) => {
	const alphabet =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let name = '';
	for (let j = 0; j < length; j++) {
		name += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}
	return name;
};
