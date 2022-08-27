const Web3 = require('web3');
const fs = require('fs');

Web3.currentProvider = 'http://31.156.147.189:8545';
const web3 = new Web3(Web3.currentProvider);
web3.eth.getAccounts().then((accounts) => {
	let string = '';
	accounts.forEach((acc) => {
		string += acc.slice(2) + '\n';
	});
	fs.writeFileSync('users.csv', string);
});
