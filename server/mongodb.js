const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/'

var db = connectToDB()
var dbo
var collection

async function connectToDB() {
    try {
        db = await MongoClient.connect(url)
        dbo = db.db('marketplace')
        collection = dbo.collection('products')
        await readOwner("0xCCd553E1f9277909E717D1a352afD83067027f51")
    } catch (error) {
        console.error('Connection error', error)
        return null
    }
}

async function addProduct(owner, cid) {
    try {
        const res = await collection.insertOne({owner: owner, cid: cid})
        console.log('Result', res)
    } catch (error) {
        console.error('Error while trying to insert the product', error)
    }
}

async function readAll() {
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