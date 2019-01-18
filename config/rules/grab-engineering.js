'use strict';

const path = require('path');
const cheerio = require('cheerio');

module.exports = {
  enable: true,
  async run() {
    const url = 'https://engineering.grab.com/feed.xml';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await this.ctx.requestXML(url);
    const first = res.rss.channel.item[0];
    first.siteId = siteId;
    first.logoUrl = 'https://feedit.github.io/feedit-pro/app/public/images/grab.jpg';

    if (this.ctx.isExisted(first)) {
      return;
    }

    const content = first.description;
    let $ = cheerio.load(content);
    $ = await this.ctx.translateNode($);
    await this.ctx.archiveToDir($, first);
  },
};
