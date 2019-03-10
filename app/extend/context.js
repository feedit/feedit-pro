'use strict';

const fs = require('fs');
const _ = require('xutil');
const path = require('path');
const request = require('request');
const xml2map = require('xml2map');
const urlResolve = require('url').resolve;
const Render = require('microtemplate').render;
const ChatBot = require('dingtalk-robot-sender');
const translate = require('google-translate-api');

const templateFile = path.join(__dirname, '..', 'template.html');
const yuqueTemplateFile = path.join(__dirname, '..', 'yuque.html');
const template = fs.readFileSync(templateFile, 'utf8');
const yuqueTemplate = fs.readFileSync(yuqueTemplateFile, 'utf8');

const pkg = require('../../package');

const { DEBUG_MODE } = process.env;

const IGNORE_STR_REG = /[\”\“\s\,\!\|\~\`\(\)\#\$\%\^\&\*\{\}\:\;\"\L\<\>\?]/g;

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
    options._title = options.title.replace(IGNORE_STR_REG, '-');
    options.pubDate = _.moment(options.pubDate).format('YY-MM-DD HH:mm:ss');
    const {
      rootDir,
    } = this.app.config.feedit;
    const htmlFile = this.genHtmlFileDir(rootDir, options);
    $ = this.resolveImage($, options);
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

    options.title = await this.translate(options.title);

    // archive to yuque
    try {
      const body = this.yuqueBeautify($, options);
      const params = {
        title: options.title,
        slug: options._title,
        body,
        cover: options.coverUrl || options.logoUrl,
      };
      const res = await this.app.yuqueClient.publicDoc(params);
      if (res.statusCode !== 200) {
        const error = new Error('YUQUE_PUBLIC_ERROR');
        error.statusCode = res.statusCode;
        error.params = params;
        throw error;
      }
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
        title: options.title,
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
      options._title = options.title.replace(IGNORE_STR_REG, '-');
      const htmlFile = this.genHtmlFileDir(rootDir, options);
      const hasFile = _.isExistedFile(htmlFile);
      if (hasFile) {
        console.log(`file existed: ${htmlFile}`);
      } else {
        console.log(`file not existed: ${htmlFile}`);
      }
      return hasFile;
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

  async translate(content) {
    const {
      autoTranslation,
    } = this.app.config.feedit;
    try {
      if (autoTranslation) {
        return (await translate(content, {
          from: 'en',
          to: 'zh-CN',
        })).text;
      }
    } catch (e) {
      this.logger.warn(e.stack);
    }
    return content;
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
            text = await this.translate(content);
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
  resolveImage($, options) {
    $('img').each(function() {
      const src = $(this).attr('src');
      if (options.link && src) {
        $(this).attr('src', urlResolve(options.link, src));
      }
    });
    return $;
  },
};
