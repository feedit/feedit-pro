'use strict';

const path = require('path');
const cheerio = require('cheerio');

const _ = require('../../app/helper');

module.exports = {
  enable: true,
  run: async () => {
    const url = 'https://code.fb.com/feed/';

    const res = await _.requestXML(url);
    const first = res.rss.channel.item[0];
    const content = first.content$encoded.$cd;

    let $ = cheerio.load(content);

    try {
      $ = await _.translateNode($);
    } catch (e) {
      console.log(e.stack);
    }

    const html = _.beautify($, first);

    const siteId = path.basename(__filename).replace('.js', '');

    _.archiveToDir({
      ...first,
      siteId,
      html,
    });
  },
};