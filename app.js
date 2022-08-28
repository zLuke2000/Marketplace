import express from 'express';
import bodyParser from 'body-parser';
import * as ic from './server/js/inputChecker.js';
import * as ipfs from './server/js/myipfs.js';
import * as db from './server/js/mongodb.js';
import * as util from './server/js/util.js';

const app = express();

//Imposto la cartella public - non è necessario specificare un metodo per l'index.html se quest'ultimo viene messo nella cartella public
app.use(express.static('./client/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//TODO: sistemare i log

// permette di recuperare tutti i prodotti in vendita
app.post('/all-products', async function (req, res) {
	console.log(`[${req.body.user}] read available products`);
	const result = await db.readAll(req.body.user, req.body.skip);
	const response = { products: [] };
	for await (const el of result) {
		const str = await ipfs.readData(el.cid);
		const product = JSON.parse(str);
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

	// ---- PerformanceTest ----
	const id = util.init(req.body.user);
	const result = await db.readByOwner(req.body.user);
	// ---- PerformanceTest ----
	util.add(req.body.user + id);

	const response = { products: [] };
	for await (const el of result) {
		const str = await ipfs.readData(el.cid);
		const product = JSON.parse(str);
		product.price = el.price;
		//aggiungo il cid al prodotto
		product.cid = el.cid;
		product.purchased = el.status === 'purchased';
		response.products.push(product);
		// ---- PerformanceTest ----
		util.add(req.body.user + id);
	}
	console.log(`[${req.body.user}] finished reading own product`);
	res.status(201).json(response);
	// ---- PerformanceTest ----
	util.end(req.body.user, id, 'raw_read');
});

// permette di vendere un prodotto
app.post('/sell-product', async function (req, res) {
	/* Struttura
	 * req.body {owner, product { name, price, image, description}}
	 */
	console.log(`[${req.body.user}] checking if inputs are valid`);

	// ---- PerformanceTest ----
	const id = util.init(req.body.user);
	const product = req.body.product;
	const response = { requestId: id };

	ic.checkProductName(product.name, response);
	ic.checkProductPrice(product.price, response);
	ic.checkProductImage(product.image, response);

	// ---- PerformanceTest ----
	util.add(req.body.user + id);
	if (response.name.status && response.price.status && response.image.status) {
		// Aggiungo il prodotto su ifps e metto il cid nella risposta
		response.cid = await ipfs.addData(
			JSON.stringify({
				name: product.name,
				description: product.description,
				image: product.image,
			})
		);
		// ---- PerformanceTest ----
		util.add(req.body.user + id);
		res.status(201).json(response);
	} else {
		res.status(500).json(response);
	}
	console.log('Server response', response);
	// ---- PerformanceTest ----
	util.add(req.body.user + id);
});

// aggiunge un prodotto al marketplace
app.post('/add-product', async (req, res) => {
	const body = req.body;
	console.log(`[${body.user}] adding a new product to the marketplace`);
	// ---- PerformanceTest ----
	util.add(body.user + body.requestId);
	const result = await db.addProduct(body.user, body.name, body.cid, body.price);
	console.log(result);
	// ---- PerformanceTest ----
	util.end(body.user, body.requestId, 'raw_sell');
	if (result) {
		res.sendStatus(201);
	} else {
		res.sendStatus(500);
	}
});

app.post('/process-product', async (req, res) => {
	// ---- PerformanceTest ----
	const id = util.init(req.body.user);
	console.log(`[${req.body.user}] processing product ${req.body.cid}`);
	const result = await db.processProduct(req.body.owner, req.body.cid, req.body.price);
	// ---- PerformanceTest ----
	util.add(req.body.user + id);
	if (result) {
		res.status(201).json({ requestId: id });
	} else {
		res.status(500).send(`Product ${req.body.cid} is already processing!`);
	}
});

app.post('/buy-product', async (req, res) => {
	console.log(`[${req.body.user}] going to buy the product ${req.body.cid}`);
	// ---- PerformanceTest ----
	console.log("USER: " + req.body.user + " ID: " + req.body.requestId)
	util.add(req.body.user + req.body.requestId);
	const result = await db.buyProduct(req.body.user, req.body.owner, req.body.cid, req.body.price);
	// ---- PerformanceTest ----
	util.end(req.body.user, req.body.requestId, 'raw_buy')
	if (result) {
		res.sendStatus(201);
	} else {
		res.sendStatus(500);
	}
});

app.post('/cancel-buy', async (req, res) => {
	console.log(`[${req.body.user}] denied transaction to buy product ${req.body.cid}`);
	const result = await db.cancelBuy(req.body.owner, req.body.cid);
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
	const response = { products: [] };
	for await (const el of result) {
		const str = await ipfs.readData(el.cid);
		const product = JSON.parse(str);
		product.owner = el.owner;
		product.price = el.price;
		product.cid = el.cid;
		response.products.push(product);
	}
	console.log('Finished to search for', req.body.user);
	res.status(201).json(response);
});

// Gestione 404 not found - deve essere messo in fono al file perchè i metodi vengono controllati in ordine
app.all('*', (_req, res) => {
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
