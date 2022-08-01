const Web3 = require('web3');
Web3.currentProvider = 'http://31.156.147.189:8545';
const web3 = new Web3(Web3.currentProvider);
printBlockNumber();
var counter = 1;
printBalance();

async function printBlockNumber() {
	const num = await web3.eth.getBlockNumber();
	console.log(`Block number is ${num}`);
}

async function printBalance(context, ee, next) {
	const accounts = await web3.eth.getAccounts();
	for (user of accounts) {
		const wei = await web3.eth.getBalance(user);
		const balance = web3.utils.fromWei(wei, 'ether');
		console.log(`(${counter++}) ${user}, ${balance} ETH`);
	}
}
