import * as WEB3 from './web3.js'
import * as HTML from './html.js'

document.querySelector('#inputProductDescription').onkeyup = function () {
    let formField = this.parentElement
    let counter = formField.querySelector('small')
    counter.textContent = this.value.length + ' / 512'  
}

//listener evento aggiunta immagine per nuovo prodotto
document.querySelector('#inputImage').addEventListener('change', function () {
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

document.querySelector('#btn_createProduct').addEventListener('click', function (e) {
    
    e.preventDefault()

    // nome, prezzo, immagine e descrizione
    const nameEl = document.querySelector("#inputProductName")
    const priceEl = document.querySelector("#inputProductPrice")
    const imageEl = document.querySelector('#inputProductImage')
    const descriptionEl = document.querySelector('#inputProductDescription')


    //TODO: controllo se window.account e' undefined
    const request = {
        'owner': window.account,
        'product': {
            'name': nameEl.value.trim(),
            'price': priceEl.valueAsNumber,
            'image': imageEl.src,
            'description': descriptionEl.value.trim()
        }
    }

    fetch('/sell-product', 
    { method: 'POST',
        body: JSON.stringify(request), 
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
     }
    })
    .then(res => res.json())
    .then((data, res) => {
        if (res.ok) {
            WEB3.buyProduct(data.cid, window.account, priceEl.valueAsNumber)
        } else {
            //TODO: controllo errore
            if (data.name === false) {
                HTML.showError(nameEl, 'The name of this product is not valid')
            }
            if (data.price === false) {
                HTML.showError(priceEl, 'This price is not valid')
            }
            if (data.image === false) {
                HTML.showError(imageEl, 'Image is not valid')
            }
        }
    })
    .catch(function (error) {
        console.log(error);
    });
});