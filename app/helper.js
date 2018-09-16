'use strict';

const fs = require('fs');
const path = require('path');
const xutil = require('xutil');
const request = require('request');
const xml2map = require('xml2map');
const Render = require('microtemplate').render;
const ChatBot = require('dingtalk-robot-sender');
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

_.translateNode = async (context, $) => {
  const list = [ 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
  for (let i = 0; i < list.length; i++) {
    const tags = $(list[i]);
    for (let j = 0; j < tags.length; j++) {
      const node = $(tags[j]);
      const content = node.text().trim();
      let text = '';
      if (content && content.length > 100) {
        try {
          await _.sleep(5000);
          text = (await translate(content, {
            from: 'en',
            to: 'zh-CN',
          })).text;
          context.logger.info(text);
        } catch (e) {
          context.logger.warn(e.stack);
        }
        node.html(`
          <div class="feedit-item">
            <span>${content}</span>
            <span class="feedit-en">${text}</span>
          </div>
        `);
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

_.genHtmlFileDir = options => {
  const {
    HOME,
    FEEDIT_ROOT,
  } = process.env;
  const distPath = path.join(FEEDIT_ROOT || HOME, pkg.name, options.siteId, options._title);
  _.mkdir(distPath);
  return path.join(distPath, 'index.html');
};

_.genJsonFileDir = options => {
  const {
    HOME,
    FEEDIT_ROOT,
  } = process.env;
  const distPath = path.join(FEEDIT_ROOT || HOME, pkg.name, options.siteId, options._title);
  _.mkdir(distPath);
  return path.join(distPath, 'archive.json');
};

_.archiveToDir = async (context, $, options) => {
  options._title = options.title.replace(/\s+/g, '-');
  options.pubDate = _.moment(options.pubDate).format('YY-MM-DD HH:mm:ss');
  const htmlFile = _.genHtmlFileDir(options);
  const html = _.beautify($, options);
  fs.writeFileSync(htmlFile, html);
  context.logger.info(`file: ${htmlFile}`);

  const jsonFile = _.genJsonFileDir(options);
  fs.writeFileSync(jsonFile, JSON.stringify({
    title: options._title,
    link: options.link,
    pubDate: options.pubDate,
    description: options.description,
    siteId: options.siteId,
  }, 2, null));
  context.logger.info(`file: ${jsonFile}`);

  const {
    WEBHOOK_URL,
  } = process.env;

  if (!WEBHOOK_URL) {
    return;
  }

  try {
    const robot = new ChatBot({
      webhook: WEBHOOK_URL,
    });

    const link = {
      title: options._title.replace(/-/g, ' '),
      text: `${options.siteId.replace(/-/g, ' ')}\n${options.pubDate}`,
      picUrl: options.logoUrl,
      messageUrl: `http://xdf.me/feedit-pro/${options.siteId}/${options._title}`
    };
    await robot.link(link)
  } catch (e) {
    context.logger.warn(e.stack);
  }
};

_.isExisted = options => {
  options._title = options.title.replace(/\s+/g, '-');
  const htmlFile = _.genHtmlFileDir(options);
  return _.isExistedFile(htmlFile);
};

module.exports = _;
