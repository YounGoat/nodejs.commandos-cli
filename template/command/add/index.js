/**
 * @author 
 * @create 
 */

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, noda = require('noda')
	
	/* in-package */
	;

/**
 * Parsed command line arguments.
 * 经过解析得到的命令行参数对象。
 * @param {Object} ARGS 
 */
function main(ARGS) {
	let { number } = ARGS;

	let sum = 0;
	for (let i = 0; i < number.length; i++) {
		sum += parseInt(number[i]);
	}
	
	console.log(sum);
}

main.desc = 'Get sum of two or more numbers.';
module.exports = main;