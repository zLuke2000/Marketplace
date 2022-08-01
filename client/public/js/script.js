import * as WEB3 from './web3.js';
import * as HTML from './html.js';
setTimeout(() => {
	if (!window.account) {
		getAllProducts(0);
		getMyProducts();
	}
}, 500);

export async function getMyProducts() {
	if (!window.account) {
		hideSpinner('#myProductsRow');
		return;
	}
	fetch('/my-products', {
		method: 'POST',
		body: JSON.stringify({ user: window.account }),
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
	})
		.then(async (res) => {
			if (res.ok) {
				const data = await res.json();
				console.log(`You have ${data.products.length} products`);
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
	showSpinner('#buyProductsRow');
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

		HTML.removeError(nameEl);
		HTML.removeError(priceEl);
		HTML.removeError(imageEl);

		this.disabled = true;
		const spinner = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
		this.innerHTML = spinner + '&nbsp;&nbsp;Processing...';

		let id = Date.now();
		for (const c of nameEl.value.trim()) {
			id += c.charCodeAt(0);
		}

		const request = {
			id: id,
			user: window.account,
			product: {
				name: nameEl.value.trim(),
				image: imageEl.src,
				description: prodDescription,
				price: priceEl.valueAsNumber,
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
					request.product.cid = data.cid;
					WEB3.createProduct(request.product, data.requestid);
					HTML.resetForm();
				} else {
					if (!data.name.status) {
						HTML.showError(nameEl, "Il nome di questo prodotto non e' valido!");
					}
					if (!data.price.status) {
						HTML.showError(priceEl, "Il prezzo inserito non e' valido!");
					}
					if (!data.image.status) {
						HTML.showError(imageEl, "L'immagine non e' valida!");
					}

					let btn = document.querySelector('#btn_createProduct');
					btn.disabled = false;
					btn.innerHTML = 'Salva prodotto';
				}
			})
			.catch(function (error) {
				console.error('Error occurred while trying to add a product!', error);
			});
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
	if (id === '#buyProductsRow') {
		const loadBtn = parent.querySelector('#loadMoreBtn');
		loadBtn.style.display = 'none';
	}
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
					if (row.childElementCount % 36 == 0) {
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
