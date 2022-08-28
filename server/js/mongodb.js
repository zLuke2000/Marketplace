import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://admin:avcu7p1g5JCL4hpfHOmYbsjgruVSd7uS@localhost:27017';
//const url = 'mongodb://localhost:27017';

const client = await connectToDB();
const collection = client.db('marketplace').collection('products');

async function connectToDB() {
	try {
		return MongoClient.connect(url);
	} catch (error) {
		console.error('[MongoDB] Connection error: ', error);
		return null;
	}
}

// aggiunge un nuovo prodotto
export async function addProduct(owner, name, cid, price) {
	try {
		const res = await collection.insertOne({
			owner: owner,
			name: name,
			cid: cid,
			price: price,
			status: 'available'
		});
		return res.acknowledged;
	} catch (error) {
		console.error('[addProduct] Error while trying to insert the product: ', error);
	}
	return false;
}

export async function processProduct(owner, cid, price) {
	try {
		const filter = { owner: owner, cid: cid, price: price, status: 'available' };
		const update = { $set: { status: 'processing'} };
		const result = await collection.updateOne(filter, update);
		return result.modifiedCount == 1;
	} catch (error) {
		console.error('[processProduct] Error while trying to process a product!', error);
	}
}

// permette l'acquisto di un prodotto modificando il proprietario e lo stato del prodotto
export async function buyProduct(user, owner, cid, price) {
	try {
		const filter = { owner: owner, cid: cid, price: price, status: 'processing' };
		const update = {
			$set: {
				owner: user,
				status: 'purchased'
			}
		};
		const result = await collection.updateOne(filter, update);
		return result.acknowledged;
	} catch (error) {
		console.error('[buyProduct] Error while trying to update data!', error);
	}
	return false;
}

export async function cancelBuy(owner, cid) {
	try {
		const filter = { owner: owner, cid: cid };
		const update = { $set: { status: 'available' } };
		const result = await collection.updateOne(filter, update);
		return result.acknowledged;
	} catch (error) {
		console.error('[cancelBuy] Error while trying to update data!', error);
	}
}

export async function resellProduct(user, cid, price) {
	try {
		const filter = { owner: user, cid: cid };
		const update = {
			$set: {
				price: price,
				status: 'available'
			}
		};
		const result = await collection.updateOne(filter, update);
		return result.acknowledged;
	} catch (error) {
		console.error('[resellProduct] Error while trying to update data!', error);
	}
	return false;
}

// legge tutti i prodotti disponibili tranne quelli dell'utente
export async function readAll(user, skip) {
	try {
		const regex = new RegExp('^(?!.*' + user + ').*');
		const query = { owner: regex, status: 'available' };
		return collection.find(query).skip(skip).limit(36).toArray();
	} catch (error) {
		console.error('[readAll] Error while trying to read the product', error);
		return null;
	}
}

// legge tutti i prodotti dell'utente
export async function readByOwner(owner) {
	try {
		return collection.find({ owner: owner }).toArray();
	} catch (error) {
		console.error('[readByOwner] Error while trying to read the product', error);
		return null;
	}
}

// permette la ricerca di un prodotto tramite stringa
export async function searchProducts(user, string, skip) {
	try {
		const reUser = new RegExp('^(?!.*' + user + ').*');
		const reProduct = new RegExp('^' + string + '.*', 'i');
		const query = { 
			owner: reUser, 
			name: reProduct, 
			status: 'available'
		};
		return collection.find(query).skip(skip).limit(36).sort({ name: 1 }).toArray();
	} catch (error) {
		console.error('[searchProducts] Error while searching for specific products!', error);
		return null;
	}
}

function closeConnection() {
	db.close();
}
