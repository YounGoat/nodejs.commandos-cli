/**
 * @author Youngoat@163.com
 * @create 2021-02-19
 */

'use strict';

const { input } = require('../../util/prompt');

const MODULE_REQUIRE = 1
	/* built-in */
	, child_process = require('child_process')
	, fs = require('fs')
	, path = require('path')
	
	/* NPM */
	, noda = require('noda')
	, AsyncDir = require('qir/AsyncDir')
	
	/* in-package */
	, myutil = noda.inRequireDir('util')
	;

const CANDIDATE_BIN_NAMES = [
	'calc',
	'calculate',
	'compute',
	'count',
	'figure',
	'abacus',
	'rod',
];

/**
 * Parsed command line arguments.
 * 经过解析得到的命令行参数对象。
 * @param {Object} ARGS 
 */
async function main(ARGS) {
	let { log, warn, verbose, error } = myutil.console;
	let { confirm } = myutil.prompt;
	let { spawnSync } = child_process;
	
	const templateDir = new AsyncDir(noda.inResolve('template'));	
	const packageDir = new AsyncDir(process.cwd());

	verbose('This is scaffolding utility based on NPM __commandos__.');
	verbose('https://www.npmjs.com/package/commandos');

	/**
	 * Verify that package.json exists.
	 * Create one if necessary.
	 * 确定当前目录系 NPM 包的根目录。
	 * 在必要情况下创建一个。
	 */
	for (let otc = 0 ; !await packageDir.exists('package.json'); otc = 1) {
		if (otc) {
			error('Failed to create *package.json*');
			return;
		}

		warn('Current directory is not an NPM package.');
		let yes = await confirm('Do npm init?');
		if (!yes) {
			return log('Bye!');
		}

		/**
		 * Run `npm init`.
		 */
		spawnSync('npm', [ 'init', '--yes' ], { stdio: 'inherit' });
	}
	const pkg = await packageDir.readJSON('package.json');
	verbose('File *package.json* parsed.');

	/**
	 * In package.json, directories.bin takes precedence over bin.
	 * directories.bin 属性优先级高于 bin 属性。
	 */
	if (!(pkg.directories && pkg.directories.bin) && !pkg.bin) {
		if (!pkg.directories) {
			pkg.directories = { bin: 'bin' };
		}
		else {
			pkg.directories.bin = 'bin';
		}
		await packageDir.writeJSON('package.json', pkg);
		log('Property __directories.bin__ added in *pakcage.json*.');
	}

	let myBinName;
	let myBinFilename;
	if (pkg.directories && pkg.directories.bin) {
		for (let i = 0; i < CANDIDATE_BIN_NAMES.length; i++) {
			myBinName = CANDIDATE_BIN_NAMES[i];
			let binFilename = path.join(pkg.directories.bin, myBinName);
			if (!await packageDir.exists(binFilename)) {
				myBinFilename = binFilename;
				break;
			}
		}
	}
	else {
		myBinName = CANDIDATE_BIN_NAMES.find(name => {
			if (pkg.bin[name]) {
				verbose(`Bin name __${name}__ occupied.`);
				return false;
			}
			else {
				verbose(`Bin name __${name}__ avaiable.`);
				return true;
			}
		});	
		if (myBinName) {
			let binFilename = `bin/${myBinName}`;
			let i = 0;
			while (await packageDir.exists(binFilename)) {
				binFilename = `bin/${myBinName}_${i++}`;
				verbose(`File __${binFilename}__ already exists.`);
			}
			myBinFilename = binFilename;
			pkg.bin[myBinName] = myBinFilename;
			await packageDir.writeJSON('package.json', pkg);
			log(`Property __bin.${myBinName}__ added in *package.json*.`);
		}
	}

	if (!myBinFilename) {
		warn('None of candicate bin names is available.');
		return log('Bye!');
	}

	/**
	 * Copy bin file from template directory.
	 * 从模板目录复制命令文件。
	 */
	await templateDir.copyFile('bin/calc', packageDir.resolve(myBinFilename));
	log(`Bin file *${myBinFilename}* created.`);	

	let myCommandDir;
	FIND_COMMAND_DIRNAME: {
		myCommandDir = myBinName;
		if (!await packageDir.exists(myCommandDir)) {
			break FIND_COMMAND_DIRNAME;
		}

		verbose(`Folder *${myCommandDir}* already exists.`);
		myCommandDir = `command_${myBinName}`;
		if (!await packageDir.exists(myCommandDir)) {
			break FIND_COMMAND_DIRNAME;
		}

		let i = 0;
		do {
			verbose(`Folder *${myCommandDir}* already exists.`)
			myCommandDir = `command_${myBinName}_${i++}`;
		  } while(!await packageDir.exists(myCommandDir));
	}

	let myUitlDir;
	FIND_UTIL_DIRNAME: {
		myUitlDir = 'util';
		if (!await packageDir.exists(myUitlDir)) {
			break FIND_UTIL_DIRNAME;
		}

		verbose(`Folder *${myUitlDir}* already exists.`);
		myUitlDir = `util_${myBinName}`;
		if (!await packageDir.exists(myUitlDir)) {
			break FIND_UTIL_DIRNAME;
		}

		let i = 0;
		do {
			verbose(`Folder *${myUitlDir}* already exists.`)
			myUitlDir = `util_${myBinName}_${i++}`;
		  } while(!await packageDir.exists(myUitlDir));
	}

	UPDATE_JS: {
		let content = await packageDir.readFile(myBinFilename, 'utf8');
		content = content
			.replace(
				/\/\*<COMMAND_DIRNAME>\*\/.+?\/\*<\/COMMAND_DIRNAME>\*\//, 
				`'${myCommandDir}'`
			)
			.replace(
				/\/\*<COMMAND_NAME>\*\/.+?\/\*<\/COMMAND_NAME>\*\//, 
				`'${myBinName}'`
			);
		await packageDir.writeFile(myBinFilename, content);
		verbose(`Bin file *${myBinFilename}* updated.`);
	}

	/**
	 * Copy subcommand folder from template directory.
	 * 从模拟目录复制子命令目录。
	 */
	await templateDir.copy('command', packageDir.resolve(myCommandDir));
	log(`Command folder *${myCommandDir}* created.`);

	/**
	 * Copy util folder from template directory.
	 * 从模拟目录复制工具目录。
	 */
	await templateDir.copy('util', packageDir.resolve(myUitlDir));
	log(`Command folder *${myUitlDir}* created.`);

	/**
	 * Add dependencies.
	 * 安装依赖。
	 */
	INSTALL_DEPENDENCIES: {
		let { dependencies } = noda.currentPackage();
		if (pkg.dependencies) {
			Object.assign(pkg.dependencies, dependencies);
		}
		else {
			pkg.dependencies = dependencies;
		}
		await packageDir.writeJSON('package.json', pkg);
		log('Property __dependencies__ changed in *package.json*.');
		spawnSync('npm', [ 'install' ], { stdio: 'inherit' });
	}

	log('-- Congratulations! --');
	log('A demo clustered command based on __commandos__ is now ready.')
	log(`Input \`node ${myBinFilename}\` and press ENTER to run the commmand.`);
	log('You may modify what created to make it your own command.');
}

main.desc = 'Create bin file and command folder.';
module.exports = main;