'use strict';
const request = require('request');

const API = 'https://en.wikipedia.org/w/api.php';
const DATA_API = 'https://www.wikidata.org/w/api.php';

const UA = 'gravestone v1.0.0';

/**
 * For a given name, looks up the lifespan of that person
 * @param {String} name the name of the person to look up
 * @returns {Promise} a promise that will be resolved with the lifespan of the person, or rejected if errors occur
 */
function gravestone(name) {
	return new Promise((resolve, reject) => {
		const config = {
			url: API,
			qs: {
				format: 'json',
				action: 'query',
				titles: name,
				prop: 'pageprops',
				ppprop: 'wikibase_item'
			},
			headers: {
				'User-Agent': UA
			},
			json: true
		};
		request(config, (err, r, wiki) => {
			if (err) {
				reject(err)
			}
			else {
				const first = Object.keys(wiki.query.pages)[0];
				if (first) {
					request({
						url: DATA_API,
						format: 'json',
						qs: {
							action: 'wbgetclaims',
							entity: wiki.query.pages[first].pageprops.wikibase_item,
							format: 'json'
						},
						headers: {
							'User-Agent': UA
						},
						json: true
					}, (err, r, details) => {
						if (err) {
							reject(err);
						}
						else {
							const born = getDate(details.claims.P569[0].mainsnak.datavalue.value.time);
							const died = getDate(details.claims.P570 ? details.claims.P570[0].mainsnak.datavalue.value.time : undefined);
							resolve({born, died});
						}
					})
				}
				else {
					resolve();
				}
			}
		});
	});
}

/**
 * Takes a point in time string and converts it to a Date object
 * @param {String} time a point in time string
 * @returns {Date} the date equivalent of the point in time string
 */
function getDate(time) {
	if (!time) {
		return undefined;
	}
	const date = new Date(time.replace(/^\+/, ''));
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
	return date;
}

module.exports = gravestone;
