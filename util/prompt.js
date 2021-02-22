/**
 * @author Youngoat@163.com
 * @create 2020-12-09
 * 
 * @see https://www.npmjs.com/package/inquirer#question
 */

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, inquirer = require('inquirer')
	
	/* in-package */
	;


module.exports = {
	checkbox(options) {
		if (Array.isArray(options)) {
			options = { choices: options };
		}
		options.name = options.name || 'PLEASE CHECK';
		options.type = 'checkbox';
		return inquirer.prompt(options).then(answer => answer[options.name]);
	},

	confirm(options) {
		if (typeof options == 'string') {
			options = { message: options };
		}
		options.name = options.name || 'PLEASE CONFIRM';
		options.type = 'confirm';
		return inquirer.prompt(options).then(answer => answer[options.name]);
	},

	input(options) {
		if (typeof options == 'string') {
			options = { message: options };
		}
		options.name = options.name || 'PLEASE INPUT';
		options.type = 'input';
		return inquirer.prompt(options).then(answer => answer[options.name]);
	},

	select(options) {
		if (Array.isArray(options)) {
			options = { choices: options };
		}
		options.name = options.name || 'PLEASE SELECT';
		options.type = 'list';
		options.loop = false;
		return inquirer.prompt(options).then(answer => answer[options.name]);
	},
};
		