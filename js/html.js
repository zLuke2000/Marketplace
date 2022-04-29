import { getCurrentAccount } from "./script.js";
import { addData } from "./ipfs.js";
import * as ic from "./inputChecker.js"

function generaCard(divID) {
    let div = document.getElementById(divID);
    
    let cardTemplate = '<div class="card mb-3"> ' +
    '<div class="row no-gutters"> ' +
    '<div class="col-md-11"> ' +
    '<div class="card-body"> ' +
    '<h5 class="card-title">Nome del prodotto</h5> ' +
    '<p class="card-text">Descrizione del prodotto.</p> ' +
    '<p class="card-text"><small class="text-muted">owner: </small></p> ' +
    '</div> ' +
    '</div> ' +
    '<div class="col-md-1"> <img src="#" class="card-img" alt="..."> </div> ' +
    '</div> ' +
    '</div> '

    div.innerHTML += cardTemplate
}

//listener evento aggiunta immagine per nuovo prodotto
document.querySelector('#inputImage').addEventListener('change', function() {
  // let file = this.files[0]
  // let url = URL.createObjectURL(file)
  // let image = document.querySelector('#inputProductImage')
  // image.src = url
  // // sistema dimensione immagine
  // let ratio = image.style.width / image.style.height
  // image.style.height = '200px';
  // image.style.width = ratio * image.style.height;
  // image.onload = () => {
  //   URL.revokeObjectURL(image.src)
  // }
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
  const base64Response = await fetch(image.src)
  const blob = await base64Response.blob()
  console.log('image as blob', blob)
  return blob
}

function blobToBase64(blob) {
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  reader.onload = () => {  }
}

// evento click per creare un nuovo prodotto
document.querySelector("#btn_createProduct").addEventListener("click", async function() {
  // Controllo che nome, prezzo e descrizione rispettino determinati parametri
  if (ic.checkProductName(document.querySelector("#inputProductName")) & ic.checkProductPrice(document.querySelector("#inputProductPrice")) & ic.checkProductDescription(document.querySelector("#inputProductDescription"))) {
    console.log("All inputs are valid!");
    console.log("Going to create a product");

    const product = {
      owner: getCurrentAccount(),
      name: document.querySelector("#inputProductName").value.trim(),
      price: document.querySelector("#inputProductPrice").value.trim(),
      descritpion: document.querySelector('#inputProductDescription').value.trim(),
      image: 'null',
      state: 'DEFAULT'
    }

    console.log("OK - ", product)
    addData()
  }
});