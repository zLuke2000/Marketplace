import express from 'express'
import path from 'path'
import fs from 'fs'
import bodyParser from 'body-parser'

import * as ic from './server/js/inputChecker.js'
import * as ipfs from './server/js/myipfs.js'
import * as db from './server/js/mongodb.js'

const app = express()
const __dirname = path.resolve();

//Imposto la cartella public - non è necessario specificare un metodo per l'index.html se quest'ultimo viene messo nella cartella public
app.use(express.static('./client/public'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

/* Gestione dei click del pulsante
 * /sell-product => metodo POST per mettere in vedita un prodotto
 * /search => metodo POST per cercare i prodotti in base al nome
 * /my-products => metodo POST richiedere i miei prodotti
 * /available-products => metodo POST richiedere i prodotti disponibili all'acquisto
 */
app.post('/all-products', async function(req, res) {
    console.log('Request from user', req.body.user, 'to read all products')
    const result = await db.readAll(req.body.user, req.body.skip)
    var response = { products: [] }
    for await (const el of result) {
        const str = await ipfs.readData(el.cid)
        var product = JSON.parse(str)
        product.cid = el.cid
        response.products.push(product)
    }
    console.log('Finished to read all products for', req.body.user)
    res.status(201).json(response)
})

app.post('/my-products', async function (req,res) {
    console.log('Request from user', req.body.user, 'to read his products')
    const result = await db.readByOwner(req.body.user)
    var response = { products: [] }
    for await (const el of result) {
        const str = await ipfs.readData(el.cid)
        var product = JSON.parse(str)
        product.cid = el.cid
        response.products.push(product)
    }
    console.log('Finished to read own products for', req.body.user)
    res.status(201).json(response)
})

app.post('/sell-product', async function(req, res) {
    /* Struttura
     * req.body { owner, product { name, price, image, description}}
     */
    console.log('json', req.body)
    const seller = req.body.owner
    const product = req.body.product

    const response = {}

    ic.checkProductName(product.name, response)
    ic.checkProductPrice(product.price, response)
    ic.checkProductImage(product.image, response)

    if(response.name.status && response.price.status && response.image.status) {
        // Aggiungo il prodotto su ifps e metto il cid nella risposta
        response.cid = await ipfs.addData(Buffer.from(JSON.stringify(product)))

        // Aggiungo cid e ownder su mongodb e metto l'id nella risposta
        response.mongo = await db.addProduct(seller, product.name, response.cid)
        res.status(201).json(response)
    } else {
        res.sendStatus(500)
    }
        //JSON.parse(buffer.toString())
})

app.post('/search-products', async (req, res) => {
    console.log('Searching for product')
    const result = await db.searchProducts(req.body.user, req.body.search, req.body.skip)
    var response = { products: [] }
    for await (const el of result) {
        const str = await ipfs.readData(el.cid)
        var product = JSON.parse(str)
        product.cid = el.cid
        response.products.push(product)
    }
    console.log('Finished to search for', req.body.user)
    res.status(201).json(response)
})

// Gestione 404 not found - deve essere messo in fono al file perchè i metodi vengono controllati in ordine
app.all('*', (req, res) => {
    console.log("Eccomi nel 404");
    res.status(404).sendFile(path.resolve(__dirname, 'client/html/404.html'))
})

//app.listen
app.listen(5000, () => { 
    console.clear()
    console.log('server is listening on port 5000...')
})