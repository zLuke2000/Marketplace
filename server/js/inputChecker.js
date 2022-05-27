export function checkProductName(name) {
    if (name === "") {
        console.error("Name is blank");
        //showError(productNameEl, "Product name cannot be blank!");
        return false;
    } else {
        console.log("Product name is ok!")
        return true;
    }
}

export function checkProductPrice(price) {
    const re = /\d/; 
    if (re.test(price)) {
        console.log("Price is ok!");
        return true;
    } else {
        console.error("Product price is not valid!");
        //showError(productPriceEl, "Product price must contain only digits!");
        return false;
    }
}

export function checkProductImage(image) {
    if (JSON.stringify(image) === '{}') {
        console.error('Must select an image!')
        //showError(productImageEl, "You must choose an image for this product!")
        return false
    } else {
        console.log('Image is ok!')
        return true
    }
}