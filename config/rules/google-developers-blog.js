'use strict';

const path = require('path');
const cheerio = require('cheerio');

module.exports = {
  enable: true,
  async run() {
    const url = 'http://feeds.feedburner.com/GDBcode';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await this.ctx.requestXML(url);
    const first = res.feed.entry[0];
    first.pubDate = first.published;
    first.link = first.author.uri;
    first.siteId = siteId;
    first.logoUrl = 'https://feedit.github.io/feedit-pro/app/public/images/google.jpg';

    if (this.ctx.isExisted(first)) {
      return;
    }

    const content = first.content;
    let $ = cheerio.load(content);

    $ = await this.ctx.translateNode($);

    await this.ctx.archiveToDir($, first);
  },
};
