import { MongoClient } from 'mongodb'
import * as fs from 'fs'

const url = 'mongodb://admin:avcu7p1g5JCL4hpfHOmYbsjgruVSd7uS@localhost:27017'
const client = await connectToDB();
const collection = client.db('marketplace').collection('products');

await readAll()
// Termina il processo corrente
process.exit()

function connectToDB() {
    try {
        return MongoClient.connect(url);
    } catch (error) {
        console.error('Connection error', error);
        return null;
    }
}

// legge tutti i prodotti disponibili tranne quelli dell'utente
async function readAll() {
    try {
        const result = await collection.find({ status: 'available' }).toArray();

        let csvString = ""
        result.forEach(product => {
            csvString += product["_id"].toString() + "\n"
        });
        fs.writeFileSync("products.csv", csvString);

    } catch (error) {
        console.error('Error while trying to read products: ', error);
    }
}