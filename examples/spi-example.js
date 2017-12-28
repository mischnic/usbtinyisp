#!/usr/bin/env node

const SPISlave = require('../spislave');

(async () => {
	const slave = new SPISlave();
	await slave.open();

	console.log(await slave.getByte('c'));
	console.log(await slave.getInt('i'));
	console.log(await slave.getLong('l'));
	console.log(await slave.getFloat('f'));

	await slave.close();
})()