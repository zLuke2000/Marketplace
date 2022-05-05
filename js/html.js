import { getCurrentAccount } from "./script.js";
import * as IPFS from "./ipfs.js";
import * as input from "./inputChecker.js"
import * as BigChain from './bigchaindb.js'

caricaProdotti()

async function caricaProdotti() {
  var products = await BigChain.searchProducts()
  if(products != undefined) {
    console.log("Products: ", products)

    let i = 1
    for(let pr of products) {
      let cid = pr.data.cid
      console.log("CID elemento:", i, cid)
      let stringObj = await IPFS.retrieveData(cid)
      let obj = JSON.parse(stringObj)
      console.log('Object from BigChain:', obj)
      await generaCard('boxAcquista', obj)
      i++
    } 
    console.log("Finished to read products from BigChainDB")
  }
}

async function generaCard(divID, obj) {
  let div = document.getElementById(divID)
  
  let arr = await IPFS.retrieveData(obj.image)
  console.log('Retrieved array:',typeof arr)
  let base64 = arrayBufferToBase64(arr)
  console.log('base64 from array:', base64)
  
    
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
  </div>`

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

// function blobToBase64(blob) {
//   const reader = new FileReader()
//   return new Promise(resolve => {
//     reader.onloadend = () => {
//       resolve(reader.result)
//     }
//     reader.readAsDataURL(blob)
//   })
// }

async function base64ToArrayBuffer(base64) {
  let response = await fetch(base64)
  return await response.arrayBuffer() 
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// evento click per creare un nuovo prodotto
document.querySelector("#btn_createProduct").addEventListener("click", async function() {
  //TODO:  notifica che il prodotto e' stato correttmente creato e pulire i campi del form
  // Controllo che nome, prezzo e descrizione rispettino determinati parametri
  let productNameEl = document.querySelector("#inputProductName")
  let productPriceEl = document.querySelector("#inputProductPrice")
  if (input.checkProductName(productNameEl) & input.checkProductPrice(productPriceEl)) {
    console.log("All inputs are valid!");
    console.log("Going to create a product");
    
    //recupera l'account di Metamask
    let address = await getCurrentAccount()
    let productDescriptionEl =  document.querySelector('#inputProductDescription')
    let image = document.querySelector('#inputProductImage')
    let arr = await base64ToArrayBuffer(image.src)
    console.log('Base64 string from image src:', image.src)
    console.log('ArrayBuffer from function:', arr)

    console.log('Adding image to IPFS')
    let img_cid = await IPFS.addData(arr)

    const product = {
      owner: address,
      name: productNameEl.value.trim(),
      price:productPriceEl.value.trim(),
      descritpion: productDescriptionEl.value.trim(),
      image: img_cid,
      purchased: 'false'
    }

    let stringObj = JSON.stringify(product)

    console.log('Adding product to IPFS')
    let cid = await IPFS.addData(stringObj)
    console.log('Product\'s cid:', cid)

    console.log('Adding product to BigChainDB')
    BigChain.createProduct(cid, address)
  }
});