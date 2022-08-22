const ganache = require('ganache');

const options = {
	wallet: { totalAccounts: '100', seed: 'marketplaceTest', accountKeysPath: 'ganache/keys.json', defaultBalance: '10000' },
	server: { host: '0.0.0.0' },
	database: { dbPath: 'ganache/db' },
};
const server = ganache.server(options);
const PORT = 8545;
server.listen(PORT, async (err) => {
	if (err) throw err;

	console.log(`ganache listening on port ${PORT}...`);
	const provider = server.provider;
	const accounts = await provider.request({
		method: 'eth_accounts',
		params: [],
	});
	console.log(server);
	console.log(provider);
	console.log(accounts);
});
