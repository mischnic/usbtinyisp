'use strict';

const usbtinyisp = require('.');
const delay = require('delay');

function AVR(){
	this.isp = new usbtinyisp({ vid: 0x1781, pid: 0x0C9F });
}

AVR.prototype.open = function(){
	return new Promise((resolve, reject) => this.isp.open(function(err){
		if(err){ return reject(err); }
		return resolve();
	}));
};

AVR.prototype.close = function(){
	return new Promise((resolve, reject) => this.isp.close(function(err){
		if(err){ return reject(err); }
		return resolve();
	}));
};

AVR.prototype.powerUp = function(){
	return new Promise((resolve, reject) => this.isp.setSCK(function(err){
		if(err){ return reject(err); }
		return resolve();
	}));
};

AVR.prototype.powerDown = function(){
	return new Promise((resolve, reject) => this.isp.powerDown(function(err){
		if(err){ return reject(err); }
		return resolve();
	}));
};

AVR.prototype.spi1 = function(val){
	return new Promise((resolve, reject) => this.isp.spi1(val, function(err, data){
		if(err){ return reject(err); }
		return resolve(data);
	}));
};




SPISlave.parseCmd = (v) =>
	typeof v === 'string' ? v.codePointAt(0) : v;


function SPISlave(){
	this.avr = new AVR();
}

SPISlave.prototype.open = async function(){
	await this.avr.open();
	await this.avr.powerUp();
};

SPISlave.prototype.close = async function(){
	await this.avr.powerDown();
	await this.avr.close();
};

SPISlave.prototype.send = async function(cmd, n){
	await this.avr.spi1(cmd);
	await delay(10);

	let val = Buffer.from([]);

	for (let i = 0; i < n; i++) {
		val = Buffer.concat([val, await this.avr.spi1(0)]);
	}

	return val;
};

SPISlave.prototype.getByte = async function(cmd){
	const buffer = await this.send(SPISlave.parseCmd(cmd), 1);
	return buffer[0];
};

SPISlave.prototype.getInt = async function(cmd){
	const buffer = await this.send(SPISlave.parseCmd(cmd), 2);
	return buffer[0] | buffer[1] << 8;
};

SPISlave.prototype.getLong = async function(cmd){
	const buffer = await this.send(SPISlave.parseCmd(cmd), 4);
	return buffer[0] | buffer[1] << 8 | buffer[2] << 16 | buffer[3] << 24;
};

SPISlave.prototype.getFloat = async function(cmd){
	const buffer = await this.send(SPISlave.parseCmd(cmd), 4);
	return buffer.readFloatLE(0);
};

module.exports = SPISlave;
