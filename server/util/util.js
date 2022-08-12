import * as fs from 'fs';
import { resolve } from 'path';

const absolutePath = resolve('');
console.log(absolutePath);
const userMap = new Map();

export function init(reqId) {
	userMap.set(reqId, [Date.now().toString()]);
}

export function add(reqId) {
	userMap.get(reqId).push(Date.now().toString());
}

export function end(reqId, name) {
	console.log(`USER: ${user} -- ID: ${id} -- NAME: ${name}`)
	add(reqId);
	fs.appendFile(`server/test/python/${name}.csv`, user + ',' + userMap.get(user+id).join(',') + '\n', function (err, _data) {
 		userMap.delete(user+id);
		if (err) throw err;
	});
}
