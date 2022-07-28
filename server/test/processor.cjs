const { faker } = require('@faker-js/faker');
const { default: axios } = require('axios');
const Web3 = require('web3');
const fs = require('fs');

Web3.currentProvider = 'http://31.156.147.189:8545';
const web3 = new Web3(Web3.currentProvider);
const json = fs.readFileSync('../../truffle/build/contracts/Marketplace.json');
const abi = JSON.parse(json).abi;
const address = '0xF861c4cb0fD9e3A52Ab88c0E1157656248dDb7F9';
const contract = new web3.eth.Contract(abi, address);

// interazione con smart contact per la creazione del prodotto
async function contractBuy(requestParams, context, ee, next) {
	try {
		const receipt = await contract.methods.createProduct(context.vars['cid'], context.vars['price']).send({ from: '0x' + context.vars['user'] });
		console.log(`0x${context.vars['user']} got receipt`);
	} catch (error) {
		console.error(`[0x${context.vars['user']}] transaction error`, error);
	}
	return next();
}

// genera randomicamente un'immagine
async function generateImage() {
	const imageURL = faker.image.abstract(280, 280);
	const raw = await axios.get(imageURL, {
		responseType: 'arraybuffer',
	});
	const base64 = Buffer.from(raw.data, 'binary').toString('base64');
	const image = `data:${raw.headers['content-type']};base64,${base64}`;
	return image;
}

//genera randomicamente un prodotto
async function generateProduct(requestParams, context, ee, next) {
	const name = faker.commerce.product();
	const desc = faker.commerce.productDescription();
	const price = parseInt(faker.commerce.price(1, 100, 0));
	const image = await generateImage();
	const product = {
		name: name,
		description: desc,
		price: price,
		image: image,
	};
	const id = faker.random.numeric(5);
	context.vars['id'] = id;
	context.vars['product'] = product;
	context.vars['name'] = name;
	context.vars['price'] = price;

	return next();
}

function contractPurchase(requestParams, context, ee, next) {
	contract.methods
		.purchaseProduct(context.vars['cid'], context.vars['owner'])
		.send({ from: '0x' + context.vars['user'], value: web3.utils.toWei(context.vars['price']) })
		.on('receipt', (receipt) => {
			console.log(`[0x${context.vars['user']}] got receipt`);
		})
		.on('error', function (error, receipt) {
			if (error) throw error;
			console.log(receipt);
		});
	return next();
}

function printStatus(requestParams, response, context, ee, next) {
	console.log(`[${context.vars['user']}] got: ${response.statusCode}`);
	if (response.statusCode === 201) {
		context.vars['status'] = true;
	}
	return next();
}

module.exports = {
	generateProduct,
	contractBuy,
	contractPurchase,
	printStatus,
};
