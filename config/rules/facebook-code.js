'use strict';

const path = require('path');
const cheerio = require('cheerio');

const _ = require('../../app/helper');

module.exports = {
  enable: true,
  logoUrl: 'https://feedit.github.io/feedit-pro/app/public/images/facebook.jpg',
  run: async context => {
    const url = 'https://code.fb.com/feed/';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await _.requestXML(url);
    const first = res.rss.channel.item[0];
    first.siteId = siteId;

    if (_.isExisted(first)) {
      return;
    }

    const content = first.content$encoded.$cd;
    let $ = cheerio.load(content);
    $ = await _.translateNode(context, $);

    await _.archiveToDir(context, $, first);
  },
};
