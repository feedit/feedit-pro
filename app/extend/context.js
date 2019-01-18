'use strict';

const fs = require('fs');
const _ = require('xutil');
const path = require('path');
const request = require('request');
const xml2map = require('xml2map');
const Render = require('microtemplate').render;
const ChatBot = require('dingtalk-robot-sender');
const translate = require('google-translate-api');

const templateFile = path.join(__dirname, '..', 'template.html');
const yuqueTemplateFile = path.join(__dirname, '..', 'yuque.html');
const template = fs.readFileSync(templateFile, 'utf8');
const yuqueTemplate = fs.readFileSync(yuqueTemplateFile, 'utf8');

const pkg = require('../../package');

const { DEBUG_MODE } = process.env;

module.exports = {
  genHtmlFileDir(rootDir, options) {
    const distPath = path.join(rootDir, pkg.name, options.siteId, options._title);
    _.mkdir(distPath);
    return path.join(distPath, 'index.html');
  },

  genJsonFileDir(rootDir, options) {
    const distPath = path.join(rootDir, pkg.name, options.siteId, options._title);
    _.mkdir(distPath);
    return path.join(distPath, 'archive.json');
  },

  async archiveToDir($, options) {
    options._title = options.title.replace(/\s+/g, '-');
    options.pubDate = _.moment(options.pubDate).format('YY-MM-DD HH:mm:ss');
    const {
      rootDir,
    } = this.app.config.feedit;
    const htmlFile = this.genHtmlFileDir(rootDir, options);
    const html = this.beautify($, options);
    fs.writeFileSync(htmlFile, html);
    this.logger.info(`file: ${htmlFile}`);

    const jsonFile = this.genJsonFileDir(rootDir, options);
    fs.writeFileSync(jsonFile, JSON.stringify({
      title: options._title,
      link: options.link,
      pubDate: options.pubDate,
      description: options.description,
      siteId: options.siteId,
    }, 2, null));
    this.logger.info(`file: ${jsonFile}`);

    // archive to yuque
    try {
      const body = this.yuqueBeautify($, options);
      await this.app.yuqueClient.publicDoc({
        title: options.title,
        slug: options._title,
        body,
      });
    } catch (e) {
      this.logger.warn(e);
    }

    const {
      dingtalk,
      site,
    } = this.app.config.feedit;

    if (!dingtalk.robotUrl) {
      return;
    }

    try {
      const robot = new ChatBot({
        webhook: dingtalk.robotUrl,
      });

      const messageUrl = `${site.baseUrl}/${options.siteId}/${encodeURIComponent(options._title)}/`;

      const link = {
        title: options._title.replace(/-/g, ' '),
        text: `${options.siteId.replace(/-/g, ' ')}\n${options.pubDate}`,
        picUrl: options.logoUrl,
        messageUrl,
      };
      await robot.link(link);
    } catch (e) {
      this.logger.warn(e.stack);
    }
  },

  isExisted(options) {
    const {
      rootDir,
    } = this.app.config.feedit;
    if (typeof options.title === 'string') {
      options._title = options.title.replace(/\s+/g, '-');
      const htmlFile = this.genHtmlFileDir(rootDir, options);
      return fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile();
    }
    return true;
  },

  async requestXML(url) {
    if (DEBUG_MODE) {
      return {
        feed: {
          entry: [
            {
              published: 'published',
              author: {
                uri: 'uri',
              },
              title: 'title',
              content: 'content',
            },
          ],
        },
        rss: {
          channel: {
            item: [
              {
                title: {
                  $cd: '$cd',
                },
                content$encoded: {
                  $cd: '$cd',
                },
                link: 'link',
                description: 'description',
              },
            ],
          },
        },
      };
    }
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
  },

  async translateNode($) {
    const {
      autoTranslation,
    } = this.app.config.feedit;

    const list = [ 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
    for (let i = 0; i < list.length; i++) {
      const tags = $(list[i]);
      for (let j = 0; j < tags.length; j++) {
        const node = $(tags[j]);
        const content = node.text().trim();
        let text = '';
        if (content && content.length > 100) {
          if (autoTranslation) {
            try {
              await this.helper.sleep(5000);
              text = (await translate(content, {
                from: 'en',
                to: 'zh-CN',
              })).text;
              this.logger.info(text);
            } catch (e) {
              this.logger.warn(e.stack);
            }
            node.html(`
            <div class="feedit-item">
              <span>${content}</span>
              <span class="feedit-en">${text}</span>
            </div>
          `);
          } else {
            node.html(`
            <div class="feedit-item">
              <span>${content}</span>
            </div>
          `);
          }
        }
      }
    }
    return $;
  },
  beautify($, options) {
    const body = $('body').html();
    return Render(template, {
      ...options,
      content: body,
    }, {
      tagOpen: '<#',
      tagClose: '#>',
    });
  },
  yuqueBeautify($, options) {
    const body = $('body').html();
    return Render(yuqueTemplate, {
      ...options,
      content: body,
    }, {
      tagOpen: '<#',
      tagClose: '#>',
    });
  },
};
