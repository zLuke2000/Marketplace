// import { getCurrentAccount } from "./web3.js"
import * as IPFS from "./ipfs.js"
import * as input from "./inputChecker.js"
import * as BigChain from './bigchaindb.js'

caricaProdotti()

async function caricaProdotti() {
  var products = await BigChain.searchProducts()
  if(products != undefined) {
    console.log("Products found: ", products.length)

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

  let cardTemplate = 
  `<div class="card mb-3">
    <div class="row">
      <div class="col-md-3">
        <img src="${obj.image}" class="card-img">
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
  console.log('Image File:', file)
  let reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    let img = document.querySelector('#inputProductImage')
    img.src = reader.result
    console.log('Length:', img.src.length)
    //sistema dimensione immagine
    let ratio = img.style.width / img.style.height
    img.style.height = '200px';
    img.style.width = ratio * img.style.height;
    console.log('Length after compression:', img.src.length)
  }
});

// evento click per creare un nuovo prodotto
document.querySelector("#btn_createProduct").addEventListener("click", async function() {
  if (!window.ethereum) {
    console.error('Metamask is required')
    alert('Please install Metamkas')
  } else {
    //TODO:  notifica che il prodotto e' stato correttmente creato e pulire i campi del form
    // Controllo che nome, prezzo e descrizione rispettino determinati parametri
    let productNameEl = document.querySelector("#inputProductName")
    let productPriceEl = document.querySelector("#inputProductPrice")
    if (input.checkProductName(productNameEl) & input.checkProductPrice(productPriceEl)) {
      console.log("All inputs are valid!");
      console.log("Going to create a product");
      
      //recupera l'account di Metamask
      // let address = await getCurrentAccount()
      let productDescriptionEl =  document.querySelector('#inputProductDescription')
      let image = document.querySelector('#inputProductImage')

      const product = {
        owner: window.account,
        name: productNameEl.value.trim(),
        price:productPriceEl.value.trim(),
        descritpion: productDescriptionEl.value.trim(),
        image: image.src,
        purchased: 'false'
      }

      let stringObj = JSON.stringify(product)

      console.log('Adding product to IPFS')
      let cid = await IPFS.addData(stringObj)
      console.log('Product\'s cid:', cid)

      console.log('Adding product to BigChainDB')
      BigChain.createProduct(cid, address)
    }
  }
});