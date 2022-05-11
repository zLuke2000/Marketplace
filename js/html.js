import * as IPFS from "./ipfs.js"
import * as input from "./inputChecker.js"
import * as BigChain from './bigchaindb.js'

caricaProdotti()

async function caricaProdotti() {
  var products = await BigChain.searchProducts()
  if(products != undefined) {
    console.log("Products found: ", products.length)

    let availableProducts = new Array()
    let myProducts = new Array()

    let i = 1
    for(let pr of products) {
      let cid = pr.data.cid
      console.log('CID elemento (', i, ') :', cid)
      let stringObj = await IPFS.readData(cid)
      let obj = JSON.parse(stringObj)
      console.log('Object from BigChain:', obj)

      if(obj.owner == window.account) {
        await generaCard('myProductsRow', obj)
        // myProducts.push(obj)
      } else {
        await generaCard('buyProductsRow', obj)
        // availableProducts.push(obj)
      }
      i++
    } 
    console.log("Finished to read products from BigChainDB")
  }
}

async function generaCard(divID, obj) {

  let div = document.getElementById(divID)

  // const cardTemplate = 
  // `<div class="card mb-3">
  //   <div class="row">
  //     <div class="col-md-3">
  //       <img src="${obj.image}" class="card-img">
  //     </div>
  //     <div class="col-md-6">
  //       <div class="card-body">
  //         <h3 class="card-title">${obj.name}</h3>
  //         <h4 class="card-text">${obj.price} ETH</h4>
  //         <p class="card-text">
  //           <small>Owner: ${obj.owner}</small>
  //         </p>
  //       </div>
  //     </div>
  //     <div class="col-md-3 justify-content-center"> 
  //       <a href="#" class="btn btn-primary">Acquista</a> 
  //     </div>
  //   </div>
  // </div>`

  const cardTemplate = 
  `<div class="col-md-4">
    <div class="card">
      <div class="container">
          <img class="card-img-top" src="${obj.image}">
          <div class="overlay">
              <h6>${obj.name}</h6>
              <p>${obj.description}</p>
          </div>
      </div>
      <div class="card-body">
          <h5 class="card-title">${obj.name}</h5>
          <p>${obj.owner}</p>
          <h6>${obj.price} ETH</h6>
      </div>
      <button>Buy now</button>
    </div>
  </div>`

  div.insertAdjacentHTML('beforeend', cardTemplate)
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
    //TODO: comprimere immagine
    console.log('Length:', img.src.length)
    //sistema dimensione immagine
    let ratio = img.style.width / img.style.height
    img.style.height = '200px';
    img.style.width = ratio * img.style.height;
    console.log('Length after compression:', img.src.length)
  }
});

// evento click per creare un nuovo prodotto
document.querySelector("#btn_createProduct").addEventListener("click", async function(event) {
  event.preventDefault()
  if (!window.ethereum) {

    console.error('Metamask is required')
    alert('Please install Metamkas')

  } else {

    // Controllo che nome, prezzo e descrizione rispettino determinati parametri
    let productNameEl = document.querySelector("#inputProductName")
    let productPriceEl = document.querySelector("#inputProductPrice")
    let image = document.querySelector('#inputProductImage')

    if (input.checkProductName(productNameEl) & input.checkProductPrice(productPriceEl) & input.checkProductImage(image)) {
      console.log("All inputs are valid!");
      console.log("Going to create a product");

      this.disabled = true
      const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
      this.innerHTML = spinner + '&nbsp;&nbsp;Processing...'

      let productDescriptionEl =  document.querySelector('#inputProductDescription')
      let prodDescription = productDescriptionEl.value.trim() === '' ? 'This product has no description' : productDescriptionEl.value.trim()

      const product = {
        owner: window.account,
        name: productNameEl.value.trim(),
        price:productPriceEl.value.trim(),
        description: prodDescription,
        image: image.src,
        purchased: 'false'
      }

      console.log('Prod Description:', product.description)

      let stringObj = JSON.stringify(product)

      console.log('Adding product to IPFS')
      let cid = await IPFS.addData(stringObj)
      console.log('Product\'s cid:', cid)

      console.log('Adding product to BigChainDB')
      BigChain.createProduct(cid, window.account)
    }
  }
});

//resetta il form di caricamento di un prodotto
export function resetForm() {
  document.querySelector('.form-group').reset()
  let btn = document.querySelector('#btn_createProduct')
  btn.disabled = false
  btn.innerHTML = 'Salva prodotto'
  document.querySelector('#inputProductImage').src = ''
  alert('The product is now available to purchase!')
}