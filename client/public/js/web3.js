import { getAllProducts, getMyProducts } from './script.js';

const contract_address = '0xd422E816F46a503F51a45215Ec74e498bcdfa90A';
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

async function loadWeb3() {
	if (window.ethereum) {
		try {
			window.web3 = new Web3(window.ethereum);
			let accounts = await window.ethereum.request({
				method: 'eth_requestAccounts',
			});
			window.account = web3.utils.toChecksumAddress(accounts[0]);
			console.log('Selected account is:', window.account);

			window.ethereum.on('accountsChanged', function (accounts) {
				window.account = web3.utils.toChecksumAddress(accounts[0]);
				document.location.reload();
			});
		} catch (error) {
			console.error('User denied access', error);
		}
	} else {
		console.error('Metamask is required!');
		window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en');
		alert('Please install Metamaks');
	}
	//leggi tutti i prodotti in base all'account attuale (anche se non definito)
	getAllProducts(0);
	getMyProducts();
}

async function loadContract() {
	return await new window.web3.eth.Contract(contract_abi, contract_address);
}

export async function createProduct(product) {
	console.log('creating the new product...');
	// calling the smart contract method
	contract.methods
		.createProduct(product.cid, product.price)
		.send({ from: window.account })
		.on('receipt', (receipt) => {
			console.log("Transaction completed here's the receipt:", receipt);
			// chiedo al server di aggiungere sul database il prodotto
			fetch('/add-product', {
				method: 'POST',
				body: JSON.stringify({ user: window.account, name: product.name, cid: product.cid }),
				headers: {
					'Content-Type': 'application/json',
				},
			})
				.then((res) => {
					if (res.ok) {
						alert('Your product has been added to the marketplace!');
					} else {
						console.error('An error occured during fetch', res.status);
					}
				})
				.catch((error) => {
					console.log('An error occured while fetching', error);
				});
		})
		.on('error', function (error, receipt) {
			console.error('An error occurred:\n' + error.message, error);
			if (receipt != null) {
				console.log('Transaction receipt:', receipt);
			}
		})
		.catch((e) => console.error('An error occurred during the transaction!', e));
}

export async function buyProduct(cid, owner, price) {
	console.log('Going to buy the product:', cid);
	// calling the smart contract method
	contract.methods
		.purchaseProduct(cid, owner)
		.send({ from: window.account, value: web3.utils.toWei(`${price}`) })
		.on('receipt', (receipt) => {
			console.log("Transaction completed here's the receipt:", receipt);
			console.log('going to fetch...');
		})
		.on('error', function (error, receipt) {
			console.error('An error occurred:\n' + error.message, error);
			if (receipt != null) {
				console.log('Transaction receipt:', receipt);
			}
		})
		.catch((error) => console.error('An error occurred during the transaction!', error));
}

async function getAllEvents() {
	contract.getPastEvents('productCreated', { fromBlock: 0, toBlock: 'latest' }).then((events) => {
		for (let event of events) {
			console.log(event.returnValues);
		}
	});
}

async function load() {
	await loadWeb3();
	if (window.account != undefined) {
		window.contract = await loadContract();
	}
}

load();
