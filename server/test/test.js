import * as IPFS from '../js/myipfs.js';
import * as db from '../js/mongodb.js';
import * as fs from 'fs';
import { faker } from '@faker-js/faker';
import axios from 'axios';

const user = '0xFe35c19B11a675d010Eb0FdeC03c47e3d830A9fB';
const userArr = [
	'0x8deE4919338bCB678635A69fa4CF4067020DF15a',
	'0x00f2923Ede246d46164Ee8476351F6098bF19bEA',
	'0x05c68A56c63D066BA1895279B01bc2982B40bB19',
	'0x252116ae7610BE9e3bc8c67257deBd47955A97fF',
	'0xcDaAE5F888b1A587F817b704Bd31FBe56d5FB26A',
	'0xca503Fdc146857c6E92fB38b208dba1Cc9d7faD4',
	'0x2D360b5FE53E3EcB102cc440CA8Ac2AA20Ef5597',
	'0x582Ea5dfd733464A887D26c6d7C35C5093e7Af85',
	'0xCcd641bc3FD7a7103101a7456F94233C38823326',
];

var image;

try {
	let data = fs.readFileSync('imageBase64.txt', 'utf-8');
	image = data;
} catch (error) {
	console.error('Error reading image', error);
}

addProducts(1);

async function generateImage() {
	const imageURL = faker.image.abstract(280, 280);
	console.log('url =', imageURL);
	const raw = await axios.get(imageURL, {
		responseType: 'arraybuffer',
	});
	const base64 = Buffer.from(raw.data, 'binary').toString('base64');
	const image = `data:${raw.headers['content-type']};base64,${base64}`;
	return image;
}

async function addProducts(num) {
	const image = await generateImage();
	console.log('Starting to add the products!');
	let start = Date.now();

	for (let i = 0; i < num; i++) {
		//Inizio creazione del prodotto
		const tsStart = Date.now();

		const product = {
			name: faker.commerce.product(),
			description: faker.commerce.productDescription(),
			image: image,
		};
		const price = faker.commerce.price(1, 100, 0);
		const owner = userArr[Math.floor(Math.random() * 100) % (userArr.length - 1)];

		let stringObj = JSON.stringify(product);
		console.log(stringObj);

		// //Fine creazione del prodotto
		// const tsJson = Date.now();
		// console.log('Product json created in:', tsJson - tsStart, 'ms');

		// //Inizio caricamneto su IPFS
		// let cid = await IPFS.addData(stringObj);

		// //Fine caricamneto su IPFS
		// const tsIpfs = Date.now();
		// console.log('Product uploaded to ipfs in:', tsIpfs - tsJson, 'ms');

		// //Inizio caricamneto su MongoDB
		// db.addProduct(owner, product.name, cid, price);

		// //Fine caricamento su MongoDB
		// const tsMongo = Date.now();
		// console.log('Product saved to MongoDB in:', tsMongo - tsIpfs, 'ms');
	}

	// console.log('Finished to add the products!');
	// let end = Date.now();
	// console.log('Elapsed time:', end - start, 'ms');
}

function saveTemplateAsFile(filename, dataObj, timestamp) {
	const blob = new Blob([JSON.stringify(dataObj)], { type: 'text/json' });
	const link = document.createElement('a');

	link.download = filename;
	link.href = window.URL.createObjectURL(blob);
	link.dataset.downloadurl = ['text/json', link.download, link.href].join(':');

	const evt = new MouseEvent('click', {
		view: window,
		bubbles: true,
		cancelable: true,
	});

	link.dispatchEvent(evt);
	link.remove();
}

//saveTemplateAsFile("test.json", product)
