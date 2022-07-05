export function checkProductName(name, json) {
	json.name = {};
	if (name === '') {
		json.name = {
			status: false,
			message: "Product's name is not valid!",
		};
		console.error('Name is blank');
	} else {
		json.name.status = true;
		console.log('Product name is ok!');
	}
}

export function checkProductPrice(price, json) {
	json.price = {};
	// solo numeri razionali positivi
	const re = /^(?![0.]+$)\d+(\.\d+)?$/g;
	if (re.test(price)) {
		console.log('Price is ok!');
		json.price.status = true;
	} else {
		console.error('Product price is not valid!');
		json.price = {
			status: false,
			message: "Product's price is not valid!",
		};
	}
}

export function checkProductImage(image, json) {
	json.image = {};
	const pattern = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
	if (image === '') {
		console.error('Must select an image!');
		json.image = {
			status: false,
			message: 'Please select an image',
		};
	} else {
		const base64 = image.split('base64,')[1];
		if (pattern.test(base64)) {
			console.log('Image is ok!');
			json.image.status = true;
		} else {
			console.log('The image is not a valid base64 string!');
			json.image = {
				status: false,
				message: 'The image is not valid!',
			};
		}
	}
}
