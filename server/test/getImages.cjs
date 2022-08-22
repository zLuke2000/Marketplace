const { faker } = require('@faker-js/faker');
const { default: axios } = require('axios');
const fs = require('fs');

console.log('Going to download images');
generateImage();
console.log('Finish');

async function generateImage() {
	const imageURL = faker.image.abstract(280, 280);
	try {
		let string = '';
		for (let i = 0; i < 500; i++) {
			console.log(`Getting image n${i}`);
			const raw = await axios.get(imageURL, {
				responseType: 'arraybuffer',
			});
			const base64 = Buffer.from(raw.data, 'binary').toString('base64');
			const image = `data:${raw.headers['content-type']};base64,${base64}`;
			string += image + '\n';
		}
		fs.writeFileSync('images.csv', string);
	} catch (error) {
		console.error('Error while generating image!', error);
	}
}
