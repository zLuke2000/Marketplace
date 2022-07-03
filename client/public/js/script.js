import * as WEB3 from './web3.js';
import * as HTML from './html.js';

export async function getMyProducts() {
	fetch('/my-products', {
		method: 'POST',
		body: JSON.stringify({ user: window.account }),
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	})
		.then(async (res) => {
			if (res.ok) {
				const data = await res.json();
				console.log('You have', data.products.length, 'products available on the market');
				data.products.forEach((element) => {
					HTML.generaCard('#myProductsRow', element);
				});
			} else {
				console.error('Error occurred during fetch', res.status);
			}
		})
		.catch(function (error) {
			console.error('Error occurred while trying to read the products!', error);
		})
		.finally(() => {
			hideSpinner('#myProductsRow');
		});
}

export async function getAllProducts(skip) {
	getProducts('/all-products', { skip: skip });
}

document.querySelector('#loadMoreBtn').addEventListener('click', async function () {
	const row = document.querySelector('#buyProductsRow');
	const searchbar = document.querySelector('#searchbar');
	const state = searchbar.getAttribute('state');
	showSpinner('#buyProductsRow');
	if (state === 'inactive') {
		getAllProducts(row.childElementCount);
	} else {
		const searchbar = document.querySelector('#searchbar');
		const text = searchbar.getAttribute('lastSearch');
		searchProducts(text, row.childElementCount);
	}
});

document.querySelector('#inputProductDescription').onkeyup = function () {
	let formField = this.parentElement;
	let counter = formField.querySelector('small');
	counter.textContent = this.value.length + ' / 512';
};

//listener evento aggiunta immagine per nuovo prodotto
//FIXME: duplicata in html.js
document.querySelector('#inputImage').addEventListener('change', function () {
	let timestampImage = [];
	timestampImage.push(Date.now());
	let file = this.files[0];
	let reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = () => {
		let imgTemp = document.createElement('img');
		imgTemp.src = reader.result;
		imgTemp.onload = () => {
			timestampImage.push(Date.now());
			compressImage(imgTemp);
			timestampImage.push(Date.now());
			console.log(
				timestampImage,
				' Tempo totale caricamneto: ',
				timestampImage[1] - timestampImage[0],
				'ms e compressione: ',
				timestampImage[2] - timestampImage[1],
				'ms'
			);
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

document.querySelector('#btn_createProduct').addEventListener('click', function (e) {
	e.preventDefault();

	if (!window.ethereum) {
		console.error('Metamask is required');
		alert('Please install Metamkas');
	} else if (window.account) {
		// nome, prezzo, immagine e descrizione
		const nameEl = document.querySelector('#inputProductName');
		const priceEl = document.querySelector('#inputProductPrice');
		const imageEl = document.querySelector('#inputProductImage');
		const descriptionEl = document.querySelector('#inputProductDescription');
		let prodDescription = descriptionEl.value.trim() === '' ? 'This product has no description' : descriptionEl.value.trim();

		HTML.removeError(nameEl);
		HTML.removeError(priceEl);
		HTML.removeError(imageEl);

		this.disabled = true;
		const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
		this.innerHTML = spinner + '&nbsp;&nbsp;Processing...';

		const request = {
			owner: window.account,
			product: {
				name: nameEl.value.trim(),
				price: priceEl.valueAsNumber,
				image: imageEl.src,
				description: prodDescription,
			},
		};

		console.log(request);

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
					//TODO: gestire caso in cui utente rifiuta il pagamento
					request.product.cid = data.cid;
					WEB3.createProduct(request.product);
					HTML.resetForm();
				} else {
					if (data.name === false) {
						HTML.showError(nameEl, 'The name of this product is not valid');
					}
					if (data.price === false) {
						HTML.showError(priceEl, 'This price is not valid');
					}
					if (data.image === false) {
						HTML.showError(imageEl, 'Image is not valid');
					}

					let btn = document.querySelector('#btn_createProduct');
					btn.disabled = false;
					btn.innerHTML = 'Salva prodotto';
				}
			})
			.catch(function (error) {
				console.error('Error occurred while trying to add a product!', error);
			});
	} else {
		console.error('User is not logged');
		alert('Please login or create an account before adding a product');
	}
});

//event handler per la ricerca di un prodotto
document.querySelector('#searchIcon').addEventListener('click', function () {
	const searchbar = document.querySelector('#searchbar');
	const text = searchbar.value.trim();
	if (text != '') {
		searchbar.setAttribute('state', 'active');
		//rimuove tutti gli elementi della row e mostra lo spinner
		const row = document.querySelector('#buyProductsRow');
		row.replaceChildren();
		showSpinner('#buyProductsRow');
		searchProducts(text, 0);
		searchbar.setAttribute('lastSearch', text);
	}
	//annulla la ricerca precendentemente eseguita
	else if (searchbar.getAttribute('state') === 'active') {
		//rimuove dalla row i risultati della ricerca eseguita
		const row = document.querySelector('#buyProductsRow');
		row.replaceChildren();
		showSpinner('#buyProductsRow');
		getAllProducts(0);
		searchbar.setAttribute('state', 'inactive');
		searchbar.removeAttribute('lastSearch');
	}
});

function searchProducts(text, skip) {
	getProducts('/search-products', {
		search: text,
		skip: skip,
	});
}

//rimuove spinner e mostra messaggio se la row non ha figli
function hideSpinner(id) {
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

//nasconde vari elementi per mostrare solo lo spinner
function showSpinner(id) {
	const row = document.querySelector(id);
	const parent = row.parentElement;
	//rende visibile solo lo spinner
	row.style.visibility = 'hidden';
	const loadBtn = parent.querySelector('#loadMoreBtn');
	loadBtn.style.display = 'none';
	const no_elem_text = parent.querySelector('.text-warn-no-product');
	no_elem_text.style.display = 'none';
	const spinner = parent.querySelector('.spinner-border');
	spinner.style.display = 'unset';
}

function getProducts(url, obj) {
	obj.user = window.account;
	fetch(url, {
		method: 'POST',
		body: JSON.stringify(obj),
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
	})
		.then(async (res) => {
			const row = document.querySelector('#buyProductsRow');
			row.style.visibility = 'visible';
			if (res.ok) {
				const data = await res.json();
				if (data.products.length > 0) {
					console.log('Found', data.products.length, 'products');
					data.products.forEach((element) => {
						HTML.generaCard('#buyProductsRow', element);
					});
					//mostra bottone 'carica altro' solo se sono stati letti n prodotti
					if (row.childElementCount % 1 == 0) {
						const loadBtn = row.parentElement.querySelector('#loadMoreBtn');
						loadBtn.style.display = 'unset';
					}
				}
			} else {
				console.error('Error during fetch', res.status);
			}
		})
		.catch((e) => {
			console.error('An error occurred during the search!', e);
		})
		.finally(() => {
			hideSpinner('#buyProductsRow');
		});
}
