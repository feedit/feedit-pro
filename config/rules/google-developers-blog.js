'use strict';

const path = require('path');
const cheerio = require('cheerio');

const _ = require('../../app/helper');

module.exports = {
  enable: true,
  logoUrl: 'https://wx3.sinaimg.cn/large/6d308bd9gy1fvbrh17ihej2028028dg3.jpg',
  run: async context => {
    const url = 'http://feeds.feedburner.com/GDBcode';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await _.requestXML(url);
    const first = res.feed.entry[0];
    first.pubDate = first.published;
    first.link = first.author.uri;
    first.siteId = siteId;

    if (_.isExisted(first)) {
      return;
    }

    const content = first.content;
    let $ = cheerio.load(content);
    $ = await _.translateNode(context, $);
    await _.archiveToDir(context, $, first);
  },
};
