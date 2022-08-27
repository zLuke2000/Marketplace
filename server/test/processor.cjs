const { faker } = require('@faker-js/faker');
const Web3 = require('web3');
const fs = require('fs');

Web3.currentProvider = 'http://31.156.147.189:8545';
const web3 = new Web3(Web3.currentProvider);
const json = fs.readFileSync('../../truffle/build/contracts/Marketplace.json');
const abi = JSON.parse(json).abi;
const address = '0xC8fB8841c585d9E504BE5aF153F2EcD2639EcE9a';
const contract = new web3.eth.Contract(abi, address);
let images = readImages();

// interazione con smart contact per la creazione del prodotto
async function createProduct(requestParams, context, ee, next) {
	console.error(`Adding product ${context.vars['cid']}...`);
	try {
		await contract.methods.createProduct(context.vars['cid'], context.vars['price']).send({ from: '0x' + context.vars['user'] });
		console.log(`============================================\t[0x${context.vars['user']}] got receipt\t===========================================`);
	} catch (error) {
		console.error(`[0x${context.vars['user']}] transaction error`, error);
	}
	return next();
}

//genera randomicamente un prodotto
async function generateProduct(requestParams, context, ee, next) {
	const product = {
		name: faker.commerce.product(),
		description: faker.commerce.productDescription(),
		price: parseInt(faker.commerce.price(1, 100, 0)),
		image: fs.readFileSync('image.txt').toString(),
	};
	context.vars['product'] = product;
	context.vars['name'] = product.name;
	context.vars['price'] = product.price;

	return next();
}

async function purchaseProduct(requestParams, context, ee, next) {
	try {
		await contract.methods
			.purchaseProduct(context.vars['cid'], '0x' + context.vars['owner'])
			.send({ from: '0x' + context.vars['user'], value: web3.utils.toWei(context.vars['price'].toString()) });
		console.log(`0x${context.vars['user']} got receipt`);
	} catch (error) {
		console.error(`[0x${context.vars['user']}] transaction error`, error);
	}
	return next();
}

function printStatus(requestParams, response, context, ee, next) {
	console.log(`[${context.vars['user']}] got: ${response.statusCode}`);
	if (response.statusCode === 201) {
		context.vars['status'] = true;
	} else {
		console.log(`[${context.vars['user']}] unable to buy product ${context.vars['cid']}`);
	}
	return next();
}

module.exports = {
	generateProduct,
	createProduct,
	purchaseProduct,
	printStatus,
};
