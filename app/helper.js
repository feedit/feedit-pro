'use strict';

const fs = require('fs');
const path = require('path');
const xutil = require('xutil');
const cheerio = require('cheerio');
const request = require('request');
const xml2map = require('xml2map');
const Render = require('microtemplate').render;
const translate = require('google-translate-api');

const templateFile = path.join(__dirname, 'template.html');
const template = fs.readFileSync(templateFile, 'utf8');

const pkg = require('../package');

const _ = xutil.merge({}, xutil);

_.sleep = second => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, second || 1000);
  });
};

_.requestXML = async url => {
  const options = {
    url,
    headers: {
      'User-Agent': 'request',
    },
  };

  const xml = await new Promise(resolve => {
    request(options, (error, response, body) => {
      resolve(body);
    });
  });
  return xml2map.tojson(xml);
};

_.translateNode = async $ => {
  const list = [ 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
  for (let i = 0; i < list.length; i++) {
    const tags = $(list[i]);
    for (let j = 0; j < tags.length; j++) {
      const node = $(tags[j]);
      let content = node.text().trim();
      if (content && content.length > 50) {
        try {
          _.sleep(1000);
          const {
            text,
          } = await translate(content, {
            from: 'en',
            to: 'zh-CN',
          });
          content = text + content;
        } catch (e) {
          console.log(e.stack);
        }
        node.text(content);
      }
    }
  }
  return $;
};

_.beautify = ($, options) => {
  const body = $('body').html();
  return Render(template, {
    ...options,
    content: body,
  }, {
    tagOpen: '<#',
    tagClose: '#>',
  });
};

_.archiveToDir = options => {
  const {
    HOME,
  } = process.env;
  const distPath = path.join(HOME, pkg.name, options.siteId, options.title);
  _.mkdir(distPath);

  fs.writeFileSync(path.join(distPath, 'index.html'), options.html);
};

module.exports = _;
