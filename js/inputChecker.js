export function checkProductName(productNameEl) {
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

export function checkProductPrice(productPriceEl) {
    const re = /\d/; 
    let price = productPriceEl.valueAsNumber;
    if (re.test(price)) {
        console.log("Price is ok!");
        removeError(productPriceEl)
        return true;
    } else {
        console.error("Product price is not valid!");
        showError(productPriceEl, "Product price must contain only digits!");
        return false;
    }
}

document.querySelector('#inputProductDescription').onkeyup = function () {
    // document.getElementById('count').innerHTML = "Characters left: " + (500 - this.value.length);
    let formField = this.parentElement
    let counter = formField.querySelector('small')
    counter.textContent = this.value.length + ' / 512'  
}

function showError(input, message) {
    let formField = input.parentElement
    formField.classList.add('error')
    let error = formField.querySelector('small')
    error.textContent = message
}
  
function removeError(input) {
    let formField = input.parentElement
    formField.classList.remove('error')
    let error = formField.querySelector('small')
    error.textContent = ''
}