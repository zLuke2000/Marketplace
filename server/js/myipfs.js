import * as IPFS from 'ipfs-core';

//const start = Date.now()
//const client = await IPFS.create();
//console.log("\n" + "IPFS: ready in " + (Date.now() - start) + " ms")

export async function addData(data) {
	if (client == undefined) {
		console.error('node is still undefined...');
		return new Promise((resolve) => {
			setTimeout(function () {
				resolve(addData(data));
			}, 5000);
		});
	} else {
		let result = await client.add(data);
		return result.path;
	}
}

export async function readData(cid) {
	if (client == undefined) {
		console.error('node is still undefined...');
		return new Promise((resolve) => {
			setTimeout(function () {
				resolve(readData(cid));
			}, 5000);
		});
	} else {
		try {
			const stream = client.cat(cid);
			let data = '';
			for await (const chunck of stream) {
				data += new TextDecoder().decode(chunck);
			}
			return data;
		} catch (error) {
			console.error('Error while retrieving data from IPFS:', error);
			return null;
		}
	}
}
