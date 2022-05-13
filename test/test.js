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

const timestampArray = [parseInt(Date.now())]

// 0 - Inizio creazione del prodotto

const product = {
    owner: window.account,
    name: items[Math.floor(Math.random() * (items.length-1))],
    price: Math.floor(Math.random() * 100)+1,
    description: lorem.substring(0, Math.floor(Math.random() * (lorem.length-1))),
    image: image,
    purchased: 'false'
}
let stringObj = JSON.stringify(product)

// Fine creazione del prodotto
// 1 -  Inizio caricamneto su IPFS

timestampArray.push(parseInt(Date.now()))
//let cid = await IPFS.addData(stringObj)

// Fine caricamneto su IPFS
// 2 - Inizio caricamneto su bigChainDB

timestampArray.push(parseInt(Date.now()))
//BigChain.createProduct(cid, window.account)

// 3 - Fine caricamento su bigChainDB

timestampArray.push(parseInt(Date.now()))
console.log("Prodotto: ", product, "salvato in ", timestampArray[3]-timestampArray[0], "millisecondi")
console.log(timestampArray)

const saveTemplateAsFile = (filename, dataObj, timestamp) => {
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
};

//saveTemplateAsFile("test.json", product)