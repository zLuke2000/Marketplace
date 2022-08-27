const Web3 = require('web3');

const web3 = new Web3('http://31.156.147.189:8545');

web3.eth.getAccounts().then((accounts) => {
	accounts.forEach((user) => {
		web3.eth.getBalance(user).then((wei) => {
			const eth = web3.utils.fromWei(wei);
			if (eth > 500) {
				console.log(`${user} ---> ${eth} ETH`);
			} else {
				console.error(`${user} ---> ${eth} ETH\t!!!!!!!!!!!!!!!!!!`);
			}
		});
	});
});
