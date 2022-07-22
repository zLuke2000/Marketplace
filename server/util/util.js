import * as fs from 'fs';

const map = new Map();

export function init(user) {
	map.set(user, [Date.now()]);
}

export function add(user) {
	map.get(user).push(Date.now());
}

export function end(user, name) {
	add(user);
	fs.appendFile(`server\\test\\python\\${name}.csv`, user + ',' + map.get(user).join(',') + '\n', function (err, data) {
		map.delete(user);
		if (err) throw err;
	});
}
