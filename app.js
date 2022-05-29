import express from 'express'
import path from 'path'
import fs from 'fs'
import bodyParser from 'body-parser'

import * as ic from './server/js/inputChecker.js'
import * as myipfs from './server/js/myipfs.js'
import * as myDB from './server/js/mongodb.js'

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
 * /mine-products => metodo POST richiedere i miei prodotti
 * /available-products => metodo POST richiedere i prodotti disponibili all'acquisto
 */
app.post('/sell-product', async function(req, res) {
    /* Struttura
     * req.body { owner, product { name, price, image, description}}
     */
    console.log('json', req.body)
    const seller = req.body.owner
    const product = req.body.product
    
    const nameStatus = ic.checkProductName(product.name)
    const priceStatus = ic.checkProductPrice(product.price)
    const imageStatus = ic.checkProductImage(product.image)

    const response = {
        'name': nameStatus,
        'price': priceStatus,
        'image': imageStatus
    }

    if(nameStatus && priceStatus && imageStatus) {
        // Aggiungo il prodotto su ifps e metto il cid nella risposta
        // response.cid = await myipfs.addData(Buffer.from(JSON.stringify(product)))

        // Aggiungo cid e ownder su mongodb e metto l'id nella risposta
        // response.mongo = await myDB.addProduct(seller, response.cid)
        res.status(201).json(response)
    } else {
        res.sendStatus(500)
    }
        //JSON.parse(buffer.toString())
})



















// Gestione 404 not found - deve essere messo in fono al file perchè i metodi vengono controllati in ordine
app.all('*', (req, res) => {
    console.log("Eccomi nel 404");
    res.status(404).sendFile(path.resolve(__dirname, 'client/html/404.html'))
})

//app.listen
app.listen(5000, () => { 
    console.log('server is listening on port 5000...') 
})