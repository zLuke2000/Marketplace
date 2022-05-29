export function checkProductName(name) {
    if (name === "") {
        console.error("Name is blank")
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
        console.error("Product price is not valid!")
        return false;
    }
}

export function checkProductImage(image) {
    const pattern = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/
    const imgStr = JSON.stringify(image)
    if (imgStr === '') {
        console.error('Must select an image!')
        return false
    } else {
        const base64 = imgStr.split('base64,')[1] 
        if(pattern.test(base64)) {
            console.log('Image is ok!')
            return true 
        } else {
            console.log('The image is not a valid base64 string!')
            return false
        }
    }
}