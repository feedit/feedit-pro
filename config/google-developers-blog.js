'use strict';

const url = 'http://feeds.feedburner.com/GDBcode';

module.exports = {
  run: async () => {
    const res = await _.requestXML(url);
    const first = res.feed.entry[0];
    const {
      title,
      content,
    } = first;
  },
};

