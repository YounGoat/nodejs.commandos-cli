/**
 * @author Youngoat@163.com
 * @create 2020-12-08
 */

'use strict';

const MODULE_REQUIRE = 1
	/* built-in */
	
	/* NPM */
	, colors = require('colors')
	
	/* in-package */
	;

const TOLEXT    = '[ Commandos ]';
const TOL       = colors.dim(TOLEXT);
const TOLINDENT = ' '.repeat(TOLEXT.length + 1);
	
/**
 * Render text if `renderer` offered, then
 * output with specified console function.
 * @param {*}  args 
 * @param {*}  action
 * @param {*} [renderer] 
 */
function _output(args, action, renderer) {
	args = Array.from(args).map(arg => {
		/**
		 * Command.
		 */
		arg = arg.replace(
			/`([^\s].*?)`/g,
			(match, Keyword) => colors.italic.blue(Keyword)
		);

		/**
		 * Highlight.
		 */
		arg = arg.replace(
			/\*\*([^\s].*?)\*\*/g,
			(match, Keyword) => colors.bold(Keyword)
		);

		/**
		 * Italic.
		 */
		arg = arg.replace(
			/\*([^\s].*?)\*/g,
			(match, Keyword) => colors.italic.green(Keyword)
		);

		/**
		 * Keyword.
		 */
		arg = arg.replace(
			/__(.+?)__/g,
			(match, Keyword) => colors.underline.blue(Keyword)
		);

		/**
		 * End-of-line.
		 */
		arg = arg.replace(
			/([\r\n]+)/g,
			(match, eol) => eol + TOLINDENT
		);

		if (renderer) {
			arg = renderer(arg);
		}

		return arg;
	});
	args.unshift(TOL);
	console[action].apply(console, args);
}

module.exports = {
	TOL,

	error() {
		_output(arguments, 'error', colors.red);
	},

	log() {
		_output(arguments, 'log');
	},

	verbose() {
		global.__verbose && _output(arguments, 'log');
	},
	
	warn() {
		_output(arguments, 'warn', colors.yellow);
	}
};