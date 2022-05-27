//import * as WEB3 from './web3.js'

// caricaProdotti()
// setTimeout(() => {
//   caricaProdotti()
// }, 3000);

//TODO lasciare soltanto funzioni per la generazione delle card

async function caricaProdotti() {
  var products = await BigChain.searchProducts()
  if(products != undefined) {

    console.log("Products found: ", products.length)
    

    let i = 1
    for(let pr of products) {
      //TODO: gestire cambio di proprietario
      let cid = pr.data.cid
      console.log('CID elemento (', i++, ') :', cid)
      let stringObj = await IPFS.readData(cid)

      //se IPFS genera un errore allora salta questo prodotto
      if (stringObj == null) {
        continue
      }

      let obj = JSON.parse(stringObj)

      if(obj.owner == window.account) {
        await generaCard('myProductsRow', obj, cid)
      } else {
        await generaCard('buyProductsRow', obj, cid)
      }
    } 

    console.log("Finished to read products from BigChainDB")

    //mostra un messaggio se non ci sono prodotti in un box
    document.querySelectorAll('.box .row').forEach( element => {
      if (element.childNodes.length == 0) {
        let parent = element.parentElement
        let spinner = parent.querySelector('.spinner-border')
        if (spinner != null) {
          spinner.remove()
        }
        let no_elem_text = parent.querySelector('.text-warn-no-product')
        no_elem_text.style.display = 'unset'
      }
    })
  }
}

async function generaCard(divID, obj, cid) {

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
              <h5 id="name" class="card-title" cid=${cid}>${obj.name}</h5>
              <p id="owner">${obj.owner}</p>
              <h6 id="price">${obj.price} ETH</h6>
              <p id="cid" style="display:none">${cid}</p>
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
              <h5 id="name" class="card-title" cid=${cid}>${obj.name}</h5>
              <h6 id="price">${obj.price} ETH</h6>
              <p id="cid" style="display:none">${cid}</p>
          </div>
          <button class="ripple">RESELL</button>
        </div>
      </div>`
      break;
  }

  //nascondi lo spinner prima di inserire il primo prodotto
  if (div.childNodes.length == 0) {
    div.parentElement.querySelector('.spinner-border').remove()
  }

  div.insertAdjacentHTML('beforeend', cardTemplate)
}


document.querySelector('#buyProductsRow').addEventListener('click', event => buyProduct(event))

//listener per l'acquisto di un prodotto
async function buyProduct(event) {
  if (event.target.tagName === 'BUTTON') {
    event.target.disabled = true
    event.target.classList.add("disabled-button");
    const spinner = '<span class="spinner-border spinner-border-sm buy-product" role="status" aria-hidden="true"></span>'
    event.target.innerHTML = spinner + '&nbsp;&nbsp;Processing...'
    
    let parent = event.target.parentElement
    let owner = parent.querySelector('#owner').innerHTML
    let name = parent.querySelector('#name').innerHTML
    let price = parent.querySelector('#price').innerHTML.replace(/\D/g, '')
    let cid = parent.querySelector('#cid').innerHTML
    console.log('Going to buy', name, 'for', price, 'ETH')
    WEB3.buyProduct(cid, owner, price)
    document.location.reload()
  }
}


//listener evento aggiunta immagine per nuovo prodotto
document.querySelector('#inputImage').addEventListener('change', function() {
  let timestampImage = []
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

    this.disabled = true
    const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
    this.innerHTML = spinner + '&nbsp;&nbsp;Processing...'

    let productDescriptionEl =  document.querySelector('#inputProductDescription')
    let prodDescription = productDescriptionEl.value.trim() === '' ? 'This product has no description' : productDescriptionEl.value.trim()

    const product = {
      name: productNameEl.value.trim(),
      price:productPriceEl.value.trim(),
      description: prodDescription,
      image: image.src
    }

    const request = {
      owner: window.account,
      product: product
    }

    fetch('/sell-product', { 
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(request)
  })

    
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