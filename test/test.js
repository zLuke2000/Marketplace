import * as IPFS from "../js/ipfs.js"
import * as BigChain from '../js/bigchaindb.js'

var xmlhttp = new XMLHttpRequest();
var lorem;
var items;
var image;

xmlhttp.open("GET", "test/lorem.txt", false);
xmlhttp.send();
if (xmlhttp.status == 200) {
    lorem = xmlhttp.responseText;
}
xmlhttp.open("GET", "test/items.txt", false);
xmlhttp.send();
if (xmlhttp.status == 200) {
    items = xmlhttp.responseText.split(/\r?\n/);
}
xmlhttp.open("GET", "test/dataBase64.txt", false);
xmlhttp.send();
if (xmlhttp.status == 200) {
    image = xmlhttp.responseText;
}

async function addProducts(num) {
    
    console.log('Starting to add the products!')
    let startingDate = Date.now()

    for (let i = 0; i < num; i++) {

        const timestampArray = [parseInt(Date.now())]

        // 0 - Inizio creazione del prodotto
        const product = {
            owner: window.account,
            name: items[i % (items.length - 1)],
            price: Math.floor(Math.random() * 100) + 1,
            description: lorem.substring(0, Math.floor(Math.random() * (lorem.length-1))),
            image: image,
            purchased: 'false'
        }

        let stringObj = JSON.stringify(product)

        // Fine creazione del prodotto
        timestampArray.push(parseInt(Date.now()))

        // 1 -  Inizio caricamneto su IPFS
        let cid = await IPFS.addData(stringObj)

        // Fine caricamneto su IPFS
        timestampArray.push(parseInt(Date.now()))

        // 2 - Inizio caricamneto su bigChainDB
        BigChain.createProduct(cid, window.account)

        // 3 - Fine caricamento su bigChainDB
        timestampArray.push(parseInt(Date.now()))

        console.log("Prodotto: ", product.name, "salvato in ", timestampArray[3] - timestampArray[0], "millisecondi")
        console.log(timestampArray) 

    }

    console.log('Finished to add the products!')
    let finishDate = Date.now()
    console.log('Elapsed time:', finishDate - startingDate, 'milliseconds')

}

window.addProducts = addProducts

function saveTemplateAsFile  (filename, dataObj, timestamp) {
    const blob = new Blob([JSON.stringify(dataObj)], { type: "text/json" });
    const link = document.createElement("a");

    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove()
}

//saveTemplateAsFile("test.json", product)