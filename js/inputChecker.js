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

export function checkProductDescription(productDescriptionEl) {
    if (productDescriptionEl.value.trim().length > 512) {
        console.error("Description exceeded lenght limit!");
        showError(productDescriptionEl, "Product description length can be 512 character max!");
        return false;
    } else {
        console.log("Description is ok!")
        removeError(productDescriptionEl)
        return true;
    }
}

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