const { faker } = require('@faker-js/faker');
const { default: axios } = require('axios');

module.exports = {
	generateProduct,
};

async function generateImage() {
	const imageURL = faker.image.abstract(280, 280);
	const raw = await axios.get(imageURL, {
		responseType: 'arraybuffer',
	});
	const base64 = Buffer.from(raw.data, 'binary').toString('base64');
	const image = `data:${raw.headers['content-type']};base64,${base64}`;
	return image;
}

async function generateProduct(requestParams, context, ee, next) {
	const name = faker.commerce.product();
	const desc = faker.commerce.productDescription();
	const price = faker.commerce.price(1, 100);
	const image = await generateImage();
	const product = {
		name: name,
		description: desc,
		price: price,
		image: image,
	};
	context.vars['product'] = product;
	context.vars['name'] = name;
	context.vars['price'] = price;

	return next();
}
