import * as IPFS from '../js/myipfs.js';
import * as db from '../js/mongodb.js';
import * as fs from 'fs';

const user = '0x00f2923Ede246d46164Ee8476351F6098bF19bEA';

//var xmlhttp = new XMLHttpRequest();
var lorem;
var items;
var image;

try {
	let data = fs.readFileSync('lorem.txt', 'utf-8');
	lorem = data;
} catch (error) {
	console.error('Error reading lorem', error);
}

try {
	let data = fs.readFileSync('imageBase64.txt', 'utf-8');
	image = data;
} catch (error) {
	console.error('Error reading image', error);
}

try {
	let data = fs.readFileSync('items.txt', 'utf-8');
	items = data.split(/\r?\n/);
} catch (error) {
	console.error('Error reading items', error);
}

/* xmlhttp.open("GET", "test/lorem.txt", false);
xmlhttp.send();
if (xmlhttp.status == 200) {
    lorem = xmlhttp.responseText;
}
xmlhttp.open("GET", "test/items.txt", false);
xmlhttp.send();
if (xmlhttp.status == 200) {
    items = xmlhttp.responseText.split(/\r?\n/);
}
xmlhttp.open("GET", "test/dataBase64.txt", false);
xmlhttp.send();
if (xmlhttp.status == 200) {
    image = xmlhttp.responseText;
} */

addProducts(1);

async function addProducts(num) {
	if (!items || !image || !lorem) {
		console.log('something is not defined');
		return;
	}

	console.log('Starting to add the products!');
	let start = Date.now();

	for (let i = 0; i < num; i++) {
		//Inizio creazione del prodotto
		const tsStart = Date.now();

		const product = {
			name: items[i % (items.length - 1)],
			description: lorem.substring(0, Math.floor(Math.random() * (lorem.length - 1))),
			image: image,
		};
		const price = Math.floor(Math.random() * 100) + 1;

		let stringObj = JSON.stringify(product);

		//Fine creazione del prodotto
		const tsJson = Date.now();
		console.log('Product json created in:', tsJson - tsStart, 'ms');

		//Inizio caricamneto su IPFS
		//FIXME: non funziona piu' il buffer...
		let cid = await IPFS.addData(stringObj);

		//Fine caricamneto su IPFS
		const tsIpfs = Date.now();
		console.log('Product uploaded to ipfs in:', tsIpfs - tsJson, 'ms');

		//Inizio caricamneto su MongoDB
		db.addProduct(user, product.name, cid, price);

		//Fine caricamento su MongoDB
		const tsMongo = Date.now();
		console.log('Product saved to MongoDB in:', tsMongo - tsIpfs, 'ms');
	}

	console.log('Finished to add the products!');
	let end = Date.now();
	console.log('Elapsed time:', end - start, 'ms');
}

//window.addProducts = addProducts

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
