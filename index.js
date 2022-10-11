const fs = require('node:fs');
const path = require('node:path');

const config = {
	base: '', // string
	depth: 0,
	maxDepth: 1,
	excludes: false, // array or regex string
	fileTypes: false // array or regex string
}

/**
 * Get directory contents
 *
 * @param      {string}  location  Path to directory
 * @return     {array}
 */
module.exports.dirContents = (location, options = {}) => {

	options = (typeof options == 'object') ? options :  new Object;

	// is current script
	var line = new Error;
	const current_script = (__filename.split(':').at(-1) === line.stack.split("\n")[2].split(' ').at(-1).split(':')[1]) ? (line.stack.split("\n")[3].split(' ').indexOf('Array.map') !== -1) : false;

	// if not called from current script ? reset config
	if (current_script === false) {
		config.base = '';
		config.depth = 0;
		config.excludes = false;
		config.maxDepth = (options.maxDepth !== undefined) ? options.maxDepth : 0;
		config.fileTypes = false;
	}

	if (config.base.length === 0) {
		config.base = location;
	}

	config.depth = config.depth + 1;

	return fs.readdirSync(location).map((item, num) => {
		if (config.maxDepth > 0) {
			if (config.depth >= (config.maxDepth + 1)) {
				return false
			}
		}

		var load_item, depth = location.replace(config.base, '').split('\\');
		depth = depth.filter((data) => { return data });

		/**
		 * Skip if
		 * - current location same as config.base
		 * - and
		 * - variable item same as file name
		 */
		if (config.base == location && path.basename(path.join(location, item)) == path.basename(__filename)) {
			return false;
		}

		// Load directory items;
		if (fs.statSync(path.join(location, item)).isDirectory()) {
			load_item = {
				[item]: this.dirContents(path.join(location, item)),
				_depth: depth,
				_isdir: true
			}

			return load_item;
		} else {
			load_item = {
				[item]: require(path.join(location, ...depth, item)),
				_depth: depth,
				_isdir: false
			}

			return load_item
		}
	}).filter(item => { return item });
}

/**
 * Mapping files content
 *
 * @param      {array}  items   File items
 * @return     {object}
 */
module.exports.mapContent = (items) => {
	const files = new Object;
	for (var i = 0; i < items.length; i++) {
		var keys = Object.keys(items[i]);
		keys.splice(keys.indexOf('_depth'), 1); // removed _depth key
		keys.splice(keys.indexOf('_isdir'), 1); // removed _isdir key

		var item = path.join(config.base, ...items[i]._depth, keys.slice().shift()); // item path
		var name = (Array.isArray(items[i][keys] && items[i]._isdir) ? path.basename(item) : path.basename(item).split('.').slice(0, -1).join('-'));

		if (name.length == 0) {
			name = Object.keys(items[i]);
			name.splice(name.indexOf('_depth'), 1);
			name = name.shift();
		}

		if (Array.isArray(items[i][keys] && items[i]._isdir)) {
			files[name] = this.mapContent(items[i][keys]);
		} else {
			files[name] = items[i][keys];
		}
	}

	return files;
}

/**
 * Get result as array
 *
 * @param      {string}  path
 * @param      {object}  options
 * @return     {array}
 */
module.exports.resultArray = (path, options) => this.dirContents(path, options);

/**
 * Result as object
 *
 * @param      {string}  path
 * @param      {object}  options
 * @return     {object}
 */
module.exports.resultObject = (path, options) => this.mapContent(this.dirContents(path, options));
