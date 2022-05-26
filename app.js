import express from 'express'
import path from 'path'
import fs from 'fs'
//import * as myipfs from './server/js/myipfs.js'
import * as myDB from './server/js/mongodb.js'

const app = express()

//Imposto la cartella public - non è necessario specificare un metodo per l'index.html se quest'ultimo viene messo nella cartella public
app.use(express.static('./client/public'))
app.use(express.urlencoded({ extended: true }))

// Gestione dei click del pulsante
app.post('/click', express.json({ type: '*/*' }), async (req, res) => {

    //const buf = Buffer.from(req.body.toString())
    //const cid = await myipfs.addData(buf)
    //const result = await myipfs.readData(cid)

    myDB.addProduct("LUCA", "CID")

    res.sendStatus(201)
})

// Gestione 404 not found - deve essere messo in fono al file perchè i metodi vengono controllati in ordine
app.all('*', (req, res) => {
    res.status(404).sendFile(path.resolve(__dirname, 'client/html/404.html'))
})

//app.listen
app.listen(5000, () => { 
    console.log('server is listening on port 5000...')
    
 })