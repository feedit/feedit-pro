'use strict';

const path = require('path');
const cheerio = require('cheerio');

const _ = require('../../app/helper');

module.exports = {
  enable: true,
  run: async context => {
    const url = 'https://engineering.grab.com/feed.xml';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await _.requestXML(url);
    const first = res.rss.channel.item[0];
    first.siteId = siteId;
    first.logoUrl = 'https://feedit.github.io/feedit-pro/app/public/images/grab.jpg';

    if (_.isExisted(first)) {
      return;
    }

    const content = first.description;
    let $ = cheerio.load(content);
    $ = await _.translateNode(context, $);
    await _.archiveToDir(context, $, first);
  },
};
