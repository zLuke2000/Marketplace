import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

import * as ic from './server/js/inputChecker.js';
import * as ipfs from './server/js/myipfs.js';
import * as db from './server/js/mongodb.js';

const app = express();
const __dirname = path.resolve();

//Imposto la cartella public - non è necessario specificare un metodo per l'index.html se quest'ultimo viene messo nella cartella public
app.use(express.static('./client/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

/* Gestione dei click del pulsante
 * /sell-product => metodo POST per mettere in vedita un prodotto
 * /search => metodo POST per cercare i prodotti in base al nome
 * /my-products => metodo POST richiedere i miei prodotti
 * /available-products => metodo POST richiedere i prodotti disponibili all'acquisto
 */

//TODO: sistemare i log

// permette di recuperare tutti i prodotti in vendita
app.post('/all-products', async function (req, res) {
	console.log(`[${req.body.user}] read available products`);
	const result = await db.readAll(req.body.user, req.body.skip);
	var response = { products: [] };
	for await (const el of result) {
		const str = await ipfs.readData(el.cid);
		var product = JSON.parse(str);
		product.owner = el.owner;
		product.price = el.price;
		//aggiungo il cid al prodotto
		product.cid = el.cid;
		response.products.push(product);
	}
	console.log(`[${req.body.user}] finished reading available products`);
	res.status(201).json(response);
});

// permette ad un utente di recuperare i propri prodotti attualmente in vendita
app.post('/my-products', async function (req, res) {
	console.log(`[${req.body.user}] request to read own product`);
	const result = await db.readByOwner(req.body.user);
	var response = { products: [] };
	for await (const el of result) {
		const str = await ipfs.readData(el.cid);
		var product = JSON.parse(str);
		product.price = el.price;
		//aggiungo il cid al prodotto
		product.cid = el.cid;
		product.purchased = el.purchased;
		response.products.push(product);
	}
	console.log(`[${req.body.user}] finished reading own product`);
	res.status(201).json(response);
});

// permette di vendere un prodotto
app.post('/sell-product', async function (req, res) {
	/* Struttura
	 * req.body { owner, product { name, price, image, description}}
	 */
	console.log(`[${req.body.user}] checking if inputs are valid`);
	const product = req.body.product;

	const response = {};

	ic.checkProductName(product.name, response);
	ic.checkProductPrice(product.price, response);
	ic.checkProductImage(product.image, response);

	if (response.name.status && response.price.status && response.image.status) {
		// Aggiungo il prodotto su ifps e metto il cid nella risposta
		//FIXME: buffer non funziona correttamente
		// response.cid = await ipfs.addData(Buffer.from(JSON.stringify(product)));
		//per recuperare il json: JSON.parse(buffer.toString())
		response.cid = await ipfs.addData(
			JSON.stringify({
				name: product.name,
				description: product.description,
				image: product.image,
			})
		);
		res.status(201).json(response);
	} else {
		res.status(500).json(response);
	}
	console.log('Server response', response);
});

// aggiunge un prodotto al marketplace
app.post('/add-product', async (req, res) => {
	console.log(`[${req.body.user}] adding a new product to the marketplace`);
	const result = await db.addProduct(req.body.user, req.body.name, req.body.cid, req.body.price);
	if (result) {
		res.sendStatus(201);
	} else {
		res.sendStatus(500);
	}
});

app.post('/buy-product', async (req, res) => {
	console.log(`[${req.body.user}] going to buy the product ${req.body.cid}`);
	const result = await db.buyProduct(req.body.user, req.body.owner, req.body.cid);
	if (result) {
		res.sendStatus(201);
	} else {
		res.sendStatus(500);
	}
});

app.post('/resell-product', async (req, res) => {
	console.log(`[${req.body.user}] resell product: ${req.body.cid}`);
	const result = await db.resellProduct(req.body.user, req.body.cid, req.body.price);
	if (result) {
		res.sendStatus(201);
	} else {
		res.sendStatus(500);
	}
});

// permette la ricerca di un prodotto tramite una stringa
app.post('/search-products', async (req, res) => {
	console.log('Searching for product');
	const result = await db.searchProducts(req.body.user, req.body.search, req.body.skip);
	var response = { products: [] };
	for await (const el of result) {
		const str = await ipfs.readData(el.cid);
		var product = JSON.parse(str);
		product.owner = el.owner;
		product.price = el.price;
		product.cid = el.cid;
		response.products.push(product);
	}
	console.log('Finished to search for', req.body.user);
	res.status(201).json(response);
});

// Gestione 404 not found - deve essere messo in fono al file perchè i metodi vengono controllati in ordine
app.all('*', (req, res) => {
	console.error('404');
	//TODO: sistemare la schermata per errore 404
	// res.status(404).sendFile(path.resolve(__dirname, 'client/html/404.html'));
	res.status(404).send('404 not found');
});

//app.listen
app.listen(5000, () => {
	console.clear();
	console.log('server is listening on port 5000...');
});
