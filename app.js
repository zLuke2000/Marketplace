import express from 'express'
import path from 'path'
import fs from 'fs'
//import * as myipfs from './server/js/myipfs.js'
import * as myDB from './server/js/mongodb.js'
import bodyParser from 'body-parser'

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
    const buf = Buffer.from(JSON.stringify(req.body))
    console.log('BODY', req.body)
    console.log('BUF', buf)
    const json = JSON.parse(buf.toString())
    console.log('json', json)
    
    res.sendStatus(201)
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