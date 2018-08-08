'use strict';

const path = require('path');
const cheerio = require('cheerio');

const _ = require('../../app/helper');

module.exports = {
  enable: true,
  run: async () => {
    const url = 'https://medium.com/feed/airbnb-engineering';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await _.requestXML(url);
    const first = res.rss.channel.item[0];
    first.siteId = siteId;
    first.title = first.title.$cd;

    if (_.isExisted(first)) {
      return;
    }

    const content = first.content$encoded.$cd;
    let $ = cheerio.load(content);

    try {
      $ = await _.translateNode($);
    } catch (e) {
      console.log(e.stack);
    }

    await _.archiveToDir($, first);
  },
};

