# feedit-pro

---

[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![node version][node-image]][node-url]

[travis-image]: https://img.shields.io/travis/feedit/feedit-pro.svg?style=flat-square
[travis-url]: https://travis-ci.org/feedit/feedit-pro
[coveralls-image]: https://img.shields.io/codecov/c/github/feedit/feedit-pro.svg?style=flat-square
[coveralls-url]: https://codecov.io/gh/feedit/feedit-pro
[node-image]: https://img.shields.io/badge/node.js-%3E=_8-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/

> help to subscribe the tech blog you want

## Watch Yuque

Welcome watch my [Yuque](https://www.yuque.com/xudafeng/technology-frontier) column and keep getting the latest knowledge.

![](https://wx2.sinaimg.cn/large/6d308bd9ly1fzbz27oe3dj21190u0h68.jpg)

## Features

- IM Robot push
- Translate English to Chinese automatically

## Dingtalk Bot

<img src="https://wx2.sinaimg.cn/large/6d308bd9ly1fyh4l6jijbj20u00y3djp.jpg" width="400" />

## Setup

### Nginx configuration

```
server {
  listen 80;
  location /feedit-pro/ {
    autoindex on;
    autoindex_localtime on;
    index index.htm index.html;
    root /usr/share/nginx/html;
  }
}
```

### Start feedit-pro

| item | type | description |
| ---- | ---- | ----------- |
| WEBHOOK_URL | string | robot url of the dingtalk group |
| BASE_URL | string | base url of your website |
| FEEDIT_ROOT_DIR | string | root directory of archive posts, default: $HOME |
| YUQUE_PRIVATE_TOKEN | string | private token for Yuque |

```bash
$ git clone https://github.com/feedit/feedit-pro.git
$ npm i
# start feedit service
$ npm run start
```

### Add rules

rules is located in [config/rules](./config/rules)

```javascript
// for example
module.exports = {
  enable: true,
  run: async function() {
    const url = 'https://medium.com/feed/netflix-techblog';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await this.ctx.requestXML(url);
    const first = res.rss.channel.item[0];
    first.siteId = siteId;
    first.title = first.title.$cd;
    first.logoUrl = 'https://feedit.github.io/feedit-pro/app/public/images/netflix.jpg';

    if (this.ctx.isExisted(first)) {
      return;
    }

    const content = first.content$encoded.$cd;
    let $ = cheerio.load(content);
    $ = await this.ctx.translateNode($);
    await this.ctx.archiveToDir($, first);
  },
};
```

## Development

```bash
$ DEBUG_MODE=true node ./app/schedule/visitor.js
```

```bash
$ npm run start:local
```

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars1.githubusercontent.com/u/1011681?v=4" width="100px;"/><br/><sub><b>xudafeng</b></sub>](https://github.com/xudafeng)<br/>|[<img src="https://avatars3.githubusercontent.com/u/1818483?v=4" width="100px;"/><br/><sub><b>ltianqi</b></sub>](https://github.com/ltianqi)<br/>
| :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto upated at `Sun Dec 23 2018 23:28:09 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
