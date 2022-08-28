export function checkProductName(name, json) {
	json.name = {};
	if (name === '') {
		json.name = {
			status: false,
			message: "Product's name is not valid!"
		};
	} else {
		json.name.status = true;
	}
}

export function checkProductPrice(price, json) {
	json.price = {};
	// solo numeri razionali positivi
	const re = /^(?![0.]+$)\d+(\.\d+)?$/g;
	if (re.test(price)) {
		json.price.status = true;
	} else {
		json.price = {
			status: false,
			message: "Product's price is not valid!"
		};
	}
}

export function checkProductImage(image, json) {
	json.image = {};
	const pattern = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
	if (image === '') {
		json.image = {
			status: false,
			message: 'Please select an image'
		};
	} else {
		const base64 = image.split('base64,')[1];
		if (pattern.test(base64)) {
			json.image.status = true;
		} else {
			json.image = {
				status: false,
				message: 'The image is not valid!'
			};
		}
	}
}
