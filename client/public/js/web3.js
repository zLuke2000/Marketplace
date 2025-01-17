import { getAllProducts, getMyProducts } from './script.js';

const contract_address = '0x09CcD23e46639a748138fCc20128684842E8f37E';
const contract_abi = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'string',
				name: 'cid',
				type: 'string',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
		],
		name: 'productCreated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'string',
				name: 'cid',
				type: 'string',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'prevOwner',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
		],
		name: 'productPurchased',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'string',
				name: 'cid',
				type: 'string',
			},
			{
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
		],
		name: 'createProduct',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'string',
				name: 'cid',
				type: 'string',
			},
			{
				internalType: 'address payable',
				name: 'owner',
				type: 'address',
			},
		],
		name: 'purchaseProduct',
		outputs: [],
		stateMutability: 'payable',
		type: 'function',
		payable: true,
	},
];

// permette il login tramite metamask
async function loadWeb3() {
	if (window.ethereum) {
		window.web3 = new Web3(window.ethereum);
		window.ethereum
			.request({ method: 'eth_requestAccounts' })
			.then((accounts) => {
				window.account = web3.utils.toChecksumAddress(accounts[0]);
				console.log('Selected account is:', window.account);
				getMyProducts();
				document.querySelector('#buyProductsRow').replaceChildren();
				getAllProducts(0);
			})
			.catch((error) => console.error('Error occurred while requesting the account!', error));

		// listener per il cambio di account tramite metamask
		window.ethereum.on('accountsChanged', function (accounts) {
			window.account = web3.utils.toChecksumAddress(accounts[0]);
			document.location.reload();
		});
		window.ethereum.on('chainChanged', function(chainId) {
			console.warn('network changed', chainId);
			if (chainId != 0x539) {
				alert(`La rete attualmente selezionata e' diversa dalla rete di ETHMarketplace!\nSeleziona la rete giusta per garantire il corretto funzionamento della pagina.`);
			}
		})
	} else {
		console.error('Metamask is required!');
		window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en');
		alert('Please install Metamaks');
	}
}

// recupera il riferimento allo smart contract
async function loadContract() {
	return new window.web3.eth.Contract(contract_abi, contract_address);
}

// permette la creazione di un prodotto
export async function createProduct(product, requestId) {
	console.log('creating the new product... ID: ', requestId);
	// calling the smart contract method
	contract.methods
		.createProduct(product.cid, web3.utils.toWei(product.price.toString()))
		.send({ from: window.account })
		.on('receipt', (receipt) => {
			console.log("Transaction completed here's the receipt:", receipt);
			// chiedo al server di aggiungere sul database il prodotto
			fetch('/add-product', {
				method: 'POST',
				body: JSON.stringify({
					requestId: requestId,
					user: window.account,
					name: product.name,
					cid: product.cid,
					price: product.price
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then((res) => {
				if (res.ok) {
					alert('Your product has been added to the marketplace!');
					document.location.reload();
				} else {
					console.error('An error occured during fetch', res.status);
				}
			}).catch((error) => console.log('An error occured while fetching', error));
		}).on('error', function (error, receipt) {
			console.error('An error occurred:\n' + error.message, error);
			if (receipt != null) {
				console.log('Transaction receipt:', receipt);
			}
		}).catch((e) => console.error('An error occurred during the transaction!', e));
}

// permette l'acquisto di un prodotto
export async function buyProduct(cid, owner, price, requestId) {
	console.log('Going to buy the product:', cid);
	// calling the smart contract method
	console.log('ID', requestId);
	contract.methods
		.purchaseProduct(cid, owner)
		.send({ from: window.account, value: web3.utils.toWei(`${price}`) })
		.on('receipt', (receipt) => {
			console.log("Transaction completed here's the receipt:", receipt);
			console.log('going to fetch...');
			//chiedo al server di aggiornare il prodotto sul database
			fetch('/buy-product', {
				method: 'POST',
				body: JSON.stringify({
					id: requestId,
					user: window.account,
					owner: owner,
					cid: cid,
					price: price }),
				headers: {
					'Content-Type': 'application/json'
				}
			}).then((res) => {
				if (res.ok) {
					alert('You have successfully purchased the product!');
					document.location.reload();
				} else {
					console.error('Something went wrong while fetching!', res.status);
				}
			}).catch((error) => console.error('An error occurred while fetching', error));
		}).on('error', function (error, receipt) {
			console.error('An error occurred:\n' + error.message, error);
			if (receipt != null) {
				console.log('Transaction receipt:', receipt);
			}
		}).catch((error) => {
			console.error('An error occurred during the transaction!', error);
			if (error.code === 4001) {
				//sblocca il prodotto se l'utente annulla la transazione
				fetch('/cancel-buy', {
					method: 'POST',
					body: JSON.stringify({ user: window.account, owner: owner, cid: cid, price: price }),
					headers: {
						'Content-Type': 'application/json'
					}
				});
			}
			document.location.reload();
		});
}

async function load() {
	await loadWeb3();
	window.contract = await loadContract();
}

load();
