import * as fs from 'fs';

const mapUser = new Map();

export function init(user, id) {
	mapUser.set(user+id, [Date.now()]);
}

export function add(user, id) {
	mapUser.get(user+id).push(Date.now());
}

export function end(user, id, name) {
	add(user, id);
	fs.appendFile(`server\\test\\python\\${name}.csv`, user + ',' + map.get(user).join(',') + '\n', function (err, _data) {
		map.delete(user+id);
		if (err) throw err;
	});
}
