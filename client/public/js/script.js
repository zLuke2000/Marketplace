import * as HTML from './html.js';

// timeout inizale
setTimeout(() => {
	if (!window.account) {
		getAllProducts(0);
		getMyProducts();
	}
}, 500);

/*
 * funzioni esportate
 */

export async function getMyProducts() {
	if (!window.account) {
		HTML.hideSpinner('#myProductsRow');
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
			HTML.hideSpinner('#myProductsRow');
		});
}

export async function getAllProducts(skip) {
	HTML.showSpinner('#buyProductsRow');
	getProducts('/all-products', { skip: skip });
}

export async function resellProduct(btn, price) {
	btn.disabled = true;
	const parent = btn.parentElement;
	console.log(`Reselling ${parent.querySelector('#name').innerHTML} for ${price} ETH`);
	fetch('/resell-product', {
		method: 'POST',
		body: JSON.stringify({ user: window.account, cid: parent.querySelector('#cid').innerHTML, price: window.web3.utils.toWei(price.toString()) }),
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

export function searchProducts(text, skip) {
	getProducts('/search-products', {
		search: text,
		skip: skip,
	});
}

/*
 * funzioni
 */

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
						row.parentElement.querySelector('#loadMoreBtn').style.display = 'unset';
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
			HTML.hideSpinner('#buyProductsRow');
		});
}