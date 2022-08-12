import * as WEB3 from './web3.js';
import * as SCRIPT from './script.js';

/*
 * funzioni esportate
 */

export function generaCard(id, obj) {
	let div = document.querySelector(id);
	let cardTemplate;

	switch (id) {
		case '#buyProductsRow':
			cardTemplate = `<div class="col-md-4">
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
			cardTemplate = `<div class="col-md-4">
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

//nasconde vari elementi per mostrare solo lo spinner
export function showSpinner(id) {
	const row = document.querySelector(id);
	const parent = row.parentElement;
	//rende visibile solo lo spinner
	row.style.visibility = 'hidden';
	if (id === '#buyProductsRow') {
		parent.querySelector('#loadMoreBtn').style.display = 'none';
	}
	parent.querySelector('.text-warn-no-product').style.display = 'none';
	parent.querySelector('.spinner-border').style.display = 'unset';
}

// rimuove spinner e mostra messaggio se la row non ha figli
export function hideSpinner(id) {
	const row = document.querySelector(id);
	const parent = row.parentElement;
	const spinner = parent.querySelector('.spinner-border');
	if (spinner.style.display != 'none') {
		spinner.style.display = 'none';
		if (row.childElementCount == 0) {
			const no_elem_text = parent.querySelector('.text-warn-no-product');
			no_elem_text.style.display = 'unset';
		}
	}
}

/*
 * listner
 */

// listener per l'acquisto di un prodotto
document.querySelector('#buyProductsRow').addEventListener('click', (event) => {
	if (event.target.tagName === 'BUTTON') {
		if (!window.account) {
			alert('You are not logged in with MetaMask! Please login before buying any products');
		} else {
			buyProduct(event.target);
		}
	}
});

// listener per caricare altri prodotti
document.querySelector('#loadMoreBtn').addEventListener('click', async function () {
	const row = document.querySelector('#buyProductsRow');
	const searchbar = document.querySelector('#searchbar');
	showSpinner('#buyProductsRow');
	if (searchbar.getAttribute('state') === 'inactive') {
		SCRIPT.getAllProducts(row.childElementCount);
	} else {
		SCRIPT.searchProducts(searchbar.getAttribute('lastSearch'), row.childElementCount);
	}
});

// listener lunghezza testo della descrizione
document.querySelector('#inputProductDescription').onkeyup = function () {
	this.parentElement.querySelector('small').textContent = this.value.length + ' / 512';
};

// listener creazione prodotto
document.querySelector('#btn_createProduct').addEventListener('click', function (e) {
	e.preventDefault();

	if (!window.account) {
		alert('You are not logged in! Please login with MetaMask before selling a product');
	} else {
		// nome, prezzo, immagine e descrizione
		const nameEl = document.querySelector('#inputProductName');
		const priceEl = document.querySelector('#inputProductPrice');
		const imageEl = document.querySelector('#inputProductImage');
		const descriptionEl = document.querySelector('#inputProductDescription');
		let prodDescription = descriptionEl.value.trim() === '' ? 'Questo prodotto non ha nessuna descrizione' : descriptionEl.value.trim();

		removeError(nameEl);
		removeError(priceEl);
		removeError(imageEl);

		this.disabled = true;
		const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
		this.innerHTML = spinner + '&nbsp;&nbsp;Processing...';

		const request = {
			user: window.account,
			product: {
				name: nameEl.value.trim(),
				image: imageEl.src,
				description: prodDescription,
				price: priceEl.valueAsNumber,
			},
		};

		fetch('/sell-product', {
			method: 'POST',
			body: JSON.stringify(request),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		})
			.then(async (res) => {
				const data = await res.json();
				if (res.ok) {
					request.product.cid = data.cid;
					WEB3.createProduct(request.product, data.requestid);
					resetForm();
				} else {
					if (!data.name.status) {
						showError(nameEl, "Il nome di questo prodotto non e' valido!");
					}
					if (!data.price.status) {
						showError(priceEl, "Il prezzo inserito non e' valido!");
					}
					if (!data.image.status) {
						showError(imageEl, "L'immagine non e' valida!");
					}

					const btn = document.querySelector('#btn_createProduct');
					btn.disabled = false;
					btn.innerHTML = 'Salva prodotto';
				}
			})
			.catch(function (error) {
				console.error('Error occurred while trying to add a product!', error);
			});
	}
});

// listener per la ricerca di un prodotto
document.querySelector('#searchIcon').addEventListener('click', function () {
	const searchbar = document.querySelector('#searchbar');
	const text = searchbar.value.trim();
	if (text != '') {
		searchbar.setAttribute('state', 'active');
		//rimuove tutti gli elementi della row e mostra lo spinner
		document.querySelector('#buyProductsRow').replaceChildren();
		showSpinner('#buyProductsRow');
		SCRIPT.searchProducts(text, 0);
		searchbar.setAttribute('lastSearch', text);
	}
	//annulla la ricerca precendentemente eseguita
	else if (searchbar.getAttribute('state') === 'active') {
		//rimuove dalla row i risultati della ricerca eseguita
		document.querySelector('#buyProductsRow').replaceChildren();
		showSpinner('#buyProductsRow');
		SCRIPT.getAllProducts(0);
		searchbar.setAttribute('state', 'inactive');
		searchbar.removeAttribute('lastSearch');
	}
});

// listener per la rivendita di un prodotto
document.querySelector('#myProductsRow').addEventListener('click', (event) => {
	if (event.target.tagName === 'BUTTON') {
		showPopup(event.target);
	}
});

// listener evento aggiunta immagine per nuovo prodotto
document.querySelector('#inputImage').addEventListener('change', function () {
	const start = Date.now();
	const reader = new FileReader();
	reader.readAsDataURL(this.files[0]);
	reader.onload = () => {
		const imgTemp = document.createElement('img');
		imgTemp.src = reader.result;
		imgTemp.onload = () => {
			const loadTime = Date.now();
			console.log('Tempo di caricamento =', loadTime - start, 'ms');
			compressImage(imgTemp);
			console.log('Tempo di compressione =', Date.now() - loadTime, 'ms');
			console.log("Tempo totale di caricamento dell'immagine =", Date.now() - start, 'ms');
		};
	};
});

/*
 * funzioni
 */

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
	console.log(`${window.account} going to process ${name} with cid ${cid}`);
	//blocca il prodotto
	fetch('/process-product', {
		method: 'POST',
		body: JSON.stringify({ user: window.account, owner: owner, cid: cid }),
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then(async (res) => {
			if (res.ok) {
				console.log(`Going to buy ${name} for ${price} ETH`);
				await WEB3.buyProduct(cid, owner, price, res.body.requestId);
			} else {
				if (res.status === 500) {
					alert('Unable to buy the product!');
					document.location.reload();
				}
				console.error('Something went wrong while fetching!', res.status);
			}
		})
		.catch((error) => console.error('An error occurred while fetching', error));
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
					step="0.001"
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
			SCRIPT.resellProduct(btn, value);
			closePopup();
		}
	});
}

// rimuove il popup per la rivendita di un prodotto
function closePopup() {
	document.querySelector('.popup-container').remove();
}

function compressImage(imgToCompress) {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	canvas.width = 280;
	canvas.height = 280;

	context.drawImage(imgToCompress, 0, 0, imgToCompress.width, imgToCompress.height, 0, 0, canvas.width, canvas.height);

	const dataURI = canvas.toDataURL('image/jpeg', 0.5);
	const img = document.querySelector('#inputProductImage');
	img.src = dataURI;
}

// resetta il form di caricamento di un prodotto
function resetForm() {
	document.querySelector('#form-sell-product').reset();
	let btn = document.querySelector('#btn_createProduct');
	btn.disabled = false;
	btn.innerHTML = 'Salva prodotto';
	document.querySelector('#inputProductImage').src = '';
}

// mostra gli errori
function showError(input, message) {
	const element = input.parentElement;
	element.classList.add('error');
	const error = element.querySelector('small');
	error.textContent = message;
}

// ripristina i cmapi
function removeError(input) {
	const element = input.parentElement;
	element.classList.remove('error');
	const error = element.querySelector('small');
	error.textContent = '';
}
