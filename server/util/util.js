import * as fs from 'fs';
import { resolve } from 'path';

const absolutePath = resolve('');
console.log(absolutePath);
const userMap = new Map();

export function init(user, id) {
	userMap.set(user+id, [Date.now().toString()]);
}

export function add(user, id) {
	userMap.get(user+id).push(Date.now().toString());
}

export function end(user, id, name) {
	console.log(`USER: ${user} -- ID: ${id} -- NAME: ${name}`)
	add(user, id);
	fs.appendFile(`server/test/python/${name}.csv`, user + ',' + userMap.get(user+id).join(',') + '\n', function (err, _data) {
 		userMap.delete(user+id);
		if (err) throw err;
	});
}
