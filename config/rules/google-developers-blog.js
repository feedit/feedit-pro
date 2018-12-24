'use strict';

const path = require('path');
const cheerio = require('cheerio');

const _ = require('../../app/helper');

module.exports = {
  enable: true,
  run: async context => {
    const url = 'http://feeds.feedburner.com/GDBcode';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await _.requestXML(url);
    const first = res.feed.entry[0];
    first.pubDate = first.published;
    first.link = first.author.uri;
    first.siteId = siteId;
    first.logoUrl = 'https://feedit.github.io/feedit-pro/app/public/images/google.jpg';

    if (_.isExisted(context, first)) {
      return;
    }

    const content = first.content;
    let $ = cheerio.load(content);

    $ = await _.translateNode(context, $);

    await _.archiveToDir(context, $, first);
  },
};
