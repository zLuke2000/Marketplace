import { addData } from "./ipfs.js";

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
document.querySelector('#inputImage').addEventListener('change', function(event) {
    let file = event.target.files[0]
    let url = URL.createObjectURL(file)
    let image = document.querySelector('#productImage')
    image.src = url
    let ratio = image.style.width / image.style.height
    image.style.height = "200px";
    image.style.width = ratio * image.style.height;
  
});

function showError(input, message) {
    // get the form-field element
    let formField = input.parentElement;
    // add the error class
    formField.classList.remove('success');
    formField.classList.add('error');
  
    // show the error message
    let error = formField.querySelector('small');
    error.textContent = message;
}
  
function removeError(input) {
    let formField = input.parentElement;
    formField.classList.remove('error');
    let error = formField.querySelector('small');
    error.textContent = '';
}
  
function checkProductName() {
    let productNameEl = document.querySelector("#inputProductName");
    if (productNameEl.value.trim() === "") {
      console.error("Name is blank");
      showError(productNameEl, "Product name cannot be blank!");
      return false;
    } else {
      console.log("Product name is ok!")
      removeError(productNameEl)
      return true;
    }
}
  
function checkProductPrice() {
    let productPriceEl = document.querySelector("#inputProductPrice");
    const re = /\d/; 
    let price = productPriceEl.valueAsNumber;
    if (!re.test(price)) {
      console.error("Product price is not valid!");
      showError(productPriceEl, "Product price must contain only digits!");
      return false;
    } else {
      console.log("Price is ok!");
      removeError(productPriceEl)
      return true;
    }
}
  
  // evento click per creare un nuovo prodotto
  document.querySelector("#btn_createProduct").addEventListener("click", function validate(e) {
    let isProductNameValid = checkProductName(),
    isProductPriceValid = checkProductPrice();
  
    if (isProductNameValid && isProductPriceValid) {
        console.log("All inputs are valid!");
        console.log("Going to create a product");
        // createProduct();
        // TODO: prendere immagine come blob o base64, creare prodotto e caricarlo su IPFS
        let img = document.querySelector('#productImage')
        let description = document.querySelector('#inputProductDescription')
        console.log(img.src)
        const product = {name: "prova", price: 5, description: description.value, image: img.src}
        console.log(product)
        // addData(product)
    }
});