import * as IPFS from "./ipfs.js"
import * as input from "./inputChecker.js"
import * as BigChain from './bigchaindb.js'

caricaProdotti()
// setTimeout(() => {
//   caricaProdotti()
// }, 3000);

async function caricaProdotti() {
  var products = await BigChain.searchProducts()
  if(products != undefined) {

    //nascondi gli spinner dei box
    let spinners = document.querySelectorAll(".box .spinner-border")
    spinners.forEach(element => {
      element.remove()
    })
    console.log("Products found: ", products.length)
    

    let i = 1
    for(let pr of products) {
      let cid = pr.data.cid
      console.log('CID elemento (', i, ') :', cid)
      let stringObj = await IPFS.readData(cid)
      let obj = JSON.parse(stringObj)

      if(obj.owner == window.account) {
        await generaCard('myProductsRow', obj)
      } else {
        await generaCard('buyProductsRow', obj)
      }
      i++
    } 
    console.log("Finished to read products from BigChainDB")
  }else{
    let warnNoProduct = document.querySelectorAll(".text-warn-no-product")
    warnNoProduct.forEach(element => {
      element.remove()
    })
  }
}

async function generaCard(divID, obj) {

  let div = document.getElementById(divID)
  let cardTemplate

  switch (divID) {

    case 'buyProductsRow':
      cardTemplate = 
      `<div class="col-md-2">
        <div class="card">
          <div class="container">
              <img class="card-img-top" src="${obj.image}">
              <div class="overlay">
                  <h6>${obj.name}</h6>
                  <p>${obj.description}</p>
              </div>
          </div>
          <div class="card-body">
              <h5 id="name" class="card-title">${obj.name}</h5>
              <p>${obj.owner}</p>
              <h6 id="price">${obj.price} ETH</h6>
          </div>
          <button class="ripple">Buy now</button>
        </div>
      </div>`
      break;
  
    case 'myProductsRow':
      
      cardTemplate = 
      `<div class="col-md-2">
        <div class="card">
          <div class="container">
              <img class="card-img-top" src="${obj.image}">
              <div class="overlay">
                  <h6>${obj.name}</h6>
                  <p>${obj.description}</p>
              </div>
          </div>
          <div class="card-body">
              <h5 id="name" class="card-title">${obj.name}</h5>
              <h6 id="price">${obj.price} ETH</h6>
          </div>
          <button class="ripple">NOT PURCHASED</button>
        </div>
      </div>`
      break;
  }

  div.insertAdjacentHTML('beforeend', cardTemplate)
}

document.querySelector('#buyProductsRow').addEventListener('click', event => buyProduct(event))

//listener per l'acquisto di un prodotto
async function buyProduct(event) {
  if (event.target.tagName === 'BUTTON') {
    let parent = event.target.parentElement
    let name = parent.querySelector('#name').innerHTML
    let price = parent.querySelector('#price').innerHTML.replace(/\D/g, '')
    console.log(name, price)
    //TODO: interazione con contratto per acquistare il prodotto
  }
}

var timestampImage
//listener evento aggiunta immagine per nuovo prodotto
document.querySelector('#inputImage').addEventListener('change', function() {
  timestampImage = []
  timestampImage.push(Date.now())
  let file = this.files[0]
  let reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    let imgTemp = document.createElement('img')
    imgTemp.src = reader.result
    imgTemp.onload = () => {
      timestampImage.push(Date.now())
      compressImage(imgTemp)
      timestampImage.push(Date.now())
      console.log(timestampImage, " Tempo totale caricamneto: ", timestampImage[1] - timestampImage[0], "ms e compressione: ", timestampImage[2] - timestampImage[1], "ms")
    }
  }
});

function compressImage(imgToCompress) {

  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  canvas.width = 280
  canvas.height = 280
  
  context.drawImage(
    imgToCompress,
    0, 0, imgToCompress.width, imgToCompress.height,
    0, 0, canvas.width, canvas.height
  )
  
  let dataURI = canvas.toDataURL('image/jpeg', 0.5)
  let img = document.querySelector('#inputProductImage')
  img.src = dataURI
}

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