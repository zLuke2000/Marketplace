import { getCurrentAccount } from "./script.js";
import * as IPFS from "./ipfs.js";
import * as input from "./inputChecker.js"
import * as BigChain from './bigchaindb.js'

// caricaProdotti()

async function caricaProdotti() {
  var products = await BigChain.searchProducts()
  if(products != undefined) {
    console.log("Products: ", products)

    let i = 1
    for(let pr of products){
      let cid = pr.data.cid
      console.log("CID elemento: ",i, cid)
      let stringObj = await IPFS.retrieveData(cid)
      let obj = JSON.parse(stringObj)
      console.log('Object from BigChain:', obj)
      await generaCard('boxAcquista', obj)
      i++
    } 
    console.log("Log dopo il for")
  }
}

async function generaCard(divID, obj) {
  let div = document.getElementById(divID);
  let blob = new Blob([obj.image.text], {type: obj.image.type})
  let base64 = await blobToBase64(blob)
  console.log(base64)
    
  let cardTemplate = 
  `<div class="card mb-3">
    <div class="row">
      <div class="col-md-3">
        <img src="${base64}" class="card-img">
      </div>
      <div class="col-md-6">
        <div class="card-body">
          <h3 class="card-title">${obj.name}</h3>
          <h4 class="card-text">${obj.price} ETH</h4>
          <p class="card-text">
            <small>Owner: ${obj.owner}</small>
          </p>
        </div>
      </div>
      <div class="col-md-3 justify-content-center"> 
        <a href="#" class="btn btn-primary">Acquista</a> 
      </div>
    </div>
  </div> `

  div.innerHTML += cardTemplate
}

//listener evento aggiunta immagine per nuovo prodotto
document.querySelector('#inputImage').addEventListener('change', function() {
  let file = this.files[0]
  let reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    let img = document.querySelector('#inputProductImage')
    img.src = reader.result
    //sistema dimensione immagine
    let ratio = img.style.width / img.style.height
    img.style.height = '200px';
    img.style.width = ratio * img.style.height;
  }
});

async function base64ToBlob(base64) {
  const base64Response = await fetch(base64)
  const blob = await base64Response.blob()
  return blob
}

function blobToBase64(blob) {
  const reader = new FileReader()
  return new Promise(resolve => {
    reader.onloadend = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(blob)
  })
}

// evento click per creare un nuovo prodotto
document.querySelector("#btn_createProduct").addEventListener("click", async function() {
  //TODO:  notifica che il prodotto e' stato correttmente creato e pulire i campi del form
  // Controllo che nome, prezzo e descrizione rispettino determinati parametri
  if (input.checkProductName(document.querySelector("#inputProductName")) & input.checkProductPrice(document.querySelector("#inputProductPrice"))) {
    console.log("All inputs are valid!");
    console.log("Going to create a product");

    let address = await getCurrentAccount()

    let img = document.querySelector('#inputProductImage')
    let blob = await base64ToBlob(img.src)
    console.log('Blob:', blob)
    let base64 = await blobToBase64(blob)
    console.log('Base64:', base64)

    let blobText = await blob.text()

    const product = {
      owner: address,
      name: document.querySelector("#inputProductName").value.trim(),
      price: document.querySelector("#inputProductPrice").value.trim(),
      descritpion: document.querySelector('#inputProductDescription').value.trim(),
      image: {
        type: blob.type,
        text: blobText
      },
      purchased: 'false'
    }

    console.log('OBJ', product)
    console.log('blob type:', product.image.type)
    console.log('blob text:', product.image.text)
    console.log('Blob:', blob)

    let stringObj = JSON.stringify(product)

    let parsedObj = JSON.parse(stringObj)
    let parsedBlob = new Blob([parsedObj.image.text], {type: parsedObj.image.type})
    console.log('Parsed blob:', parsedObj.image.text)


    let parsedBase64 = await blobToBase64(parsedBlob)
    console.log('Parsed base64:', parsedBase64)
    console.log('Blob are equal:', blob == parsedBlob)
    console.log('Blob originale:', blob)
    console.log('Parsed blob:', parsedBlob)

    // let cid = await IPFS.addData(stringObj)
    // console.log('Product\'s cid:', cid)

    // BigChain.createProduct(cid, address)
  }
});