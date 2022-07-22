import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://admin:avcu7p1g5JCL4hpfHOmYbsjgruVSd7uS@localhost:27017';
// const url = 'mongodb://localhost:27017';

const client = await connectToDB();
const dbo = client.db('marketplace');
const collection = dbo.collection('products');

async function connectToDB() {
	try {
		return MongoClient.connect(url);
	} catch (error) {
		console.error('Connection error', error);
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
			purchased: false,
		});
		return res.acknowledged;
	} catch (error) {
		console.error('Error while trying to insert the product', error);
	}
	return false;
}

// permette l'acquisto di un prodotto modificando il proprietario e lo stato del prodotto
export async function buyProduct(user, owner, cid) {
	try {
		const filter = { owner: owner, cid: cid };
		const update = {
			$set: {
				owner: user,
				purchased: true,
			},
		};
		const result = await collection.updateOne(filter, update);
		console.log(`Updated ${result.modifiedCount} document`);
		return result.acknowledged;
	} catch (error) {
		console.error('Error while trying to update data!', error);
	}
	return false;
}

export async function resellProduct(user, cid, price) {
	try {
		const filter = { owner: user, cid: cid };
		const update = {
			$set: {
				price: price,
				purchased: false,
			},
		};
		const result = await collection.updateOne(filter, update);
		console.log(`Updated ${result.modifiedCount} document`);
		return result.acknowledged;
	} catch (error) {
		console.error('Error while trying to update data!', error);
	}
	return false;
}

// legge tutti i prodotti disponibili tranne quelli dell'utente
export async function readAll(user, skip) {
	try {
		const regex = new RegExp('^(?!.*' + user + ').*');
		const query = { owner: regex, purchased: false };
		const result = await collection.find(query).skip(skip).limit(36).toArray();
		return result;
	} catch (error) {
		console.error('1 - Error while trying to read the product', error);
		return null;
	}
}

// legge tutti i prodotti dell'utente
export async function readByOwner(owner) {
	try {
		const result = await collection.find({ owner: owner }).toArray();
		return result;
	} catch (error) {
		console.error('2 - Error while trying to read the product', error);
		return null;
	}
}

// permette la ricerca di un prodotto tramite stringa
export async function searchProducts(user, string, skip) {
	try {
		const reUser = new RegExp('^(?!.*' + user + ').*');
		const reProduct = new RegExp('^' + string + '.*', 'i');
		const query = { owner: reUser, name: reProduct, purchased: false };
		const result = await collection.find(query).skip(skip).limit(36).sort({ name: 1 }).toArray();
		return result;
	} catch (error) {
		console.error('Error while searching for specific products!', error);
		return null;
	}
}

function closeConnection() {
	db.close();
}
