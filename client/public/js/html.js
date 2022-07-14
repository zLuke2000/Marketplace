import * as WEB3 from './web3.js';

export function generaCard(id, obj) {
	let div = document.querySelector(id);
	let cardTemplate;

	switch (id) {
		case '#buyProductsRow':
			cardTemplate = `<div class="col-md-2">
        <div class="card">
          <div class="container">
              <img class="card-img-top" src="${obj.image}">
              <div class="overlay">
                  <h6>${obj.name}</h6>
                  <p>${obj.description}</p>
              </div>
          </div>
          <div class="card-body">
              <h5 id="name" class="card-title" cid=${obj.cid}>${obj.name}</h5>
              <p id="owner">${obj.owner}</p>
              <h6 id="price">${obj.price} ETH</h6>
              <p id="cid" style="display:none">${obj.cid}</p>
          </div>
          <button class="ripple">ACQUISTA</button>
        </div>
      </div>`;
			break;

		case '#myProductsRow':
			cardTemplate = `<div class="col-md-2">
				<div class="card">
				<div class="container">
					<img class="card-img-top" src="${obj.image}">
					<div class="overlay">
						<h6>${obj.name}</h6>
						<p>${obj.description}</p>
					</div>
				</div>
				<div class="card-body">
					<h5 id="name" class="card-title" cid=${obj.cid}>${obj.name}</h5>
					<h6 id="price">${obj.price} ETH</h6>
					<p id="cid" style="display:none">${obj.cid}</p>
				</div>
				<button ${obj.purchased ? 'class="ripple"' : 'disabled'}>${obj.purchased ? 'RIVENDI' : 'SUL MERCATO'}</button>
				</div>
			</div>`;
			break;
	}

	//nascondi elementi prima di inserire il primo prodotto
	if (div.childNodes.length == 0) {
		div.parentElement.querySelector('.spinner-border').style.display = 'none';
		div.parentElement.querySelector('.text-warn-no-product').style.display = 'none';
	}

	div.insertAdjacentHTML('beforeend', cardTemplate);
}

//listener per l'acquisto di un prodotto
document.querySelector('#buyProductsRow').addEventListener('click', (event) => {
	if (event.target.tagName === 'BUTTON') {
		if (!window.account) {
			alert('You are not logged in with MetaMask! Please login before buying any products');
		} else {
			buyProduct(event.target);
		}
	}
});

async function buyProduct(btn) {
	btn.disabled = true;
	// btn.classList.add('disabled-button');
	const spinner = '<span class="spinner-border spinner-border-sm buy-product" role="status" aria-hidden="true"></span>';
	btn.innerHTML = spinner + '&nbsp;&nbsp;Processing...';

	const parent = btn.parentElement;
	const owner = parent.querySelector('#owner').innerHTML;
	const name = parent.querySelector('#name').innerHTML;
	const price = parent.querySelector('#price').innerHTML.replace(/\D/g, '');
	const cid = parent.querySelector('#cid').innerHTML;
	console.log(`Going to buy ${name} for ${price} ETH`);
	await WEB3.buyProduct(cid, owner, price);
}

//listener per la rivendita di un prodotto
document.querySelector('#myProductsRow').addEventListener('click', (event) => {
	if (event.target.tagName === 'BUTTON') {
		showPopup(event.target);
	}
});

async function resellProduct(btn, price) {
	btn.disabled = true;
	const parent = btn.parentElement;
	const name = parent.querySelector('#name').innerHTML;
	const cid = parent.querySelector('#cid').innerHTML;
	console.log(`Reselling ${name} for ${price} ETH`);
	fetch('/resell-product', {
		method: 'POST',
		body: JSON.stringify({ user: window.account, cid: cid, price: price }),
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((res) => {
			if (res.ok) {
				btn.innerHTML = 'SUL MERCATO';
				parent.querySelector('#price').innerHTML = `${price} ETH`;
				alert('Your product is now available on the market!');
			} else {
				console.error('Something went wrong while fetching!', res.status);
			}
		})
		.catch((error) => console.error('An error occurred while fetching!', error));
}

function showPopup(btn) {
	const popup = `<div class="popup-container">
		<div class="popup">
			<h3>A che prezzo vuoi rivendere questo prodotto?</h3>
			<div class="input-field">
				<input id="inputResellPrice"
					type="number"
					class="form-control no-spin"
					placeholder="Inserisci il prezzo del prodotto in ETH"
					min="0.001"
					max="1000000"
					step="0.1"
				/>
				<small></small>
			</div>
			<div class="btn-container">
				<button class="ripple" id="popup-ok">OK</button>
				<button class="ripple" id="popup-cancel">ANNULLA</button>
			</div>
		</div>
	</div>`;
	document.querySelector('body').insertAdjacentHTML('afterbegin', popup);
	document.querySelector('.popup-container').addEventListener('click', function (e) {
		if (e.target == this || e.target.id === 'popup-cancel') {
			closePopup();
		}
	});
	document.querySelector('#popup-ok').addEventListener('click', function () {
		const priceEL = document.querySelector('#inputResellPrice');
		let value = priceEL.valueAsNumber;
		removeError(priceEL);
		if (value > priceEL.max) {
			showError(priceEL, 'This price is too high!');
			priceEL.value = priceEL.max;
		} else if (value < priceEL.min) {
			showError(priceEL, 'This price is too low!');
			priceEL.value = priceEL.min;
		} else if (isNaN(value)) {
			showError(priceEL, 'This price is not valid!');
			priceEL.value = 1;
		} else {
			console.log('price ok');
			resellProduct(btn, value);
			closePopup();
		}
	});
}

// rimuove il popup per la rivendita di un prodotto
function closePopup() {
	document.querySelector('.popup-container').remove();
}

//listener evento aggiunta immagine per nuovo prodotto
document.querySelector('#inputImage').addEventListener('change', function () {
	const start = Date.now();
	let file = this.files[0];
	let reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => {
		let imgTemp = document.createElement('img');
		imgTemp.src = reader.result;
		imgTemp.onload = () => {
			const loadTime = Date.now();
			console.log('Tempo di caricamento =', loadTime - start, 'ms');
			compressImage(imgTemp);
			const compressionTime = Date.now();
			console.log('Tempo di compressione =', compressionTime - loadTime, 'ms');
			const end = Date.now();
			console.log("Tempo totale di caricamento dell'immagine =", end - start, 'ms');
		};
	};
});

function compressImage(imgToCompress) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = 280;
	canvas.height = 280;

	context.drawImage(imgToCompress, 0, 0, imgToCompress.width, imgToCompress.height, 0, 0, canvas.width, canvas.height);

	let dataURI = canvas.toDataURL('image/jpeg', 0.5);
	let img = document.querySelector('#inputProductImage');
	img.src = dataURI;
}

//resetta il form di caricamento di un prodotto
export function resetForm() {
	document.querySelector('#form-sell-product').reset();
	let btn = document.querySelector('#btn_createProduct');
	btn.disabled = false;
	btn.innerHTML = 'Salva prodotto';
	document.querySelector('#inputProductImage').src = '';
}

export function showError(input, message) {
	const element = input.parentElement;
	element.classList.add('error');
	const error = element.querySelector('small');
	error.textContent = message;
}

export function removeError(input) {
	const element = input.parentElement;
	element.classList.remove('error');
	const error = element.querySelector('small');
	error.textContent = '';
}
