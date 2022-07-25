import * as fs from 'fs';

const userMap = new Map();

export function init(user, id) {
	console.log("Creo timestamp per l'utente: " + user  + " con id operazione: " + id)
	userMap.set(user+id, [Date.now().toString()]);
}

export function add(user, id) {
	console.log("utente: " + user  + " id operazione: " + id)
	userMap.get(user+id).push(Date.now().toString());
}

export function end(user, id, name) {
	add(user, id);
	fs.appendFile(`/marketplace/server/test/python/${name}.csv`, user + ',' + userMap.get(user+id).join(',') + '\n', function (err, _data) {
		userMap.delete(user+id);
		if (err) throw err;
	});
}
