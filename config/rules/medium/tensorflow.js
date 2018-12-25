'use strict';

const path = require('path');
const cheerio = require('cheerio');

module.exports = {
  enable: true,
  run: async function() {
    const url = 'https://medium.com/feed/tensorflow';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await this.ctx.requestXML(url);
    const first = res.rss.channel.item[0];
    first.siteId = siteId;
    first.title = first.title.$cd;
    first.logoUrl = 'https://feedit.github.io/feedit-pro/app/public/images/tensorflow.jpg';

    if (this.ctx.isExisted(first)) {
      return;
    }

    const content = first.content$encoded.$cd;
    let $ = cheerio.load(content);
    $ = await this.ctx.translateNode($);
    await this.ctx.archiveToDir($, first);
  },
};
