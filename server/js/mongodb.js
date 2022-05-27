import { MongoClient } from 'mongodb'

// Connection URL
const url = 'mongodb://localhost:27017';

const client = await connectToDB()
const dbo = client.db('marketplace')
const collection = dbo.collection('products')

async function connectToDB() {
    try {
        return MongoClient.connect(url)
    } catch (error) {
        console.error('Connection error', error)
        return null
    }
}

export async function addProduct(owner, cid) {
    try {
        const res = await collection.insertOne({owner: owner, cid: cid})
        console.log('Result', res)
        return res.acknowledged
    } catch (error) {
        console.error('Error while trying to insert the product', error)
    }
    return false
}

export async function readAll() {
    try {
        console.log("Cerco per tutti")
        var counter = 0
        await collection.find().forEach(element => {
            console.log(++counter, ": ", element);
        })
    } catch (error) {
        console.error('1 - Error while trying to read the product', error)
    }
}

async function readOwner(owner) {
    try {
        console.log("Cerco per: ", owner)
        var counter = 0
        await collection.find({ owner: owner }).forEach(element => {
            console.log(++counter, ": ", element);
        })
    } catch (error) {
        console.error('2 - Error while trying to read the product', error)
    }
}



function closeConnection() {
    db.close()
}