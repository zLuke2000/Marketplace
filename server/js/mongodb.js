import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://localhost:27017';

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

export async function addProduct(owner, name, cid) {
    try {
        const res = await collection.insertOne({ owner: owner, name: name, cid: cid, purchased: false });
        return res.acknowledged;
    } catch (error) {
        console.error('Error while trying to insert the product', error);
    }
    return false;
}

export async function readAll(user, skip) {
    try {
        const regex = new RegExp('^(?!.*' + user + ').*');
        const query = { owner: regex, purchased: false };
        const result = await collection.find(query).skip(skip).limit(1).toArray();
        return result;
    } catch (error) {
        console.error('1 - Error while trying to read the product', error);
        return null;
    }
}

export async function readByOwner(owner) {
    try {
        //FIXME: ritornare solo prodotti non acquistati?
        // i prodotti con "purchased: true" hanno a disposizione il tasto "resell"
        // per rimettere in vendita lo stesso prodotto (con un prezzo differente)
        const result = await collection.find({ owner: owner }).toArray();
        return result;
    } catch (error) {
        console.error('2 - Error while trying to read the product', error);
        return null;
    }
}

export async function searchProducts(user, string, skip) {
    try {
        const reUser = new RegExp('^(?!.*' + user + ').*');
        const reProduct = new RegExp('^' + string + '.*');
        const query = { owner: reUser, name: reProduct, purchased: false };
        const result = await collection.find(query).skip(skip).limit(1).sort({ name: 1 }).toArray();
        return result;
    } catch (error) {
        console.error('Error while searching for specific products!', error);
        return null;
    }
}

function closeConnection() {
    db.close();
}
