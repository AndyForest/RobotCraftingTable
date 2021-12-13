/* eslint-env es6 */
(function () {
	'use strict';
	// import fetch from 'node-fetch';
	const fetch = require('node-fetch');

	var Delegator = function () {
		var SteamTIFF;

		this.init = () => {
			SteamTIFF = module.parent.exports;
			SteamTIFF.log.notify('💼  Initializing Delegator');
		};

		this.get = (url, data, headers) => this.request(url, data, 'get', headers);
		this.post = (url, data, headers) => this.request(url, data, 'post', headers);
		this.put = (url, data, headers) => this.request(url, data, 'put', headers);
		this.delete = (url, data, headers) => this.request(url, data, 'delete', headers);

		this.request = (url, data, method, headers) =>
			new Promise((resolve, reject) => {
				if (typeof method === 'object') {
					headers = method;
					method = 'get';
				}
				method = method || 'get';
				data = data || false;
				headers = typeof headers === 'object' ? headers : {};
				if (method === 'get') {
					url += url.indexOf('?') === -1 ? '?' : '&';
					url += data ? this.urlEncode(data) : '';
					data = null;
				}
				fetch(url, { method: method, headers: headers, body: this.urlEncode(data) })
					.then((response) => response.json())
					.then(resolve)
					.catch(reject);
			});

		this.urlEncode = (obj) => {
			if (typeof obj === 'string') return obj;
			obj = typeof obj === 'object' ? obj : {};
			return Object.keys(obj)
				.map((key) => (key += obj[key]))
				.join('&');
		};

		this.init();
	};
	module.exports = () => new Delegator();
})();
