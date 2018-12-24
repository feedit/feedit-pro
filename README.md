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
| FEEDIT_ROOT | string | root directory of archive posts, default: $HOME |

```bash
$ git clone https://github.com/feedit/feedit-pro.git
$ npm i
# start feedit service
$ WEBHOOK_URL=xxx BASE_URL=https://your.site FEEDIT_ROOT=/usr/share/nginx/html npm run start
```

### Add rules

rules is located in [config/rules](./config/rules)

```javascript
// for example
module.exports = {
  enable: true,
  run: async context => {
    const url = 'https://medium.com/feed/netfix-techblog';
    const siteId = path.basename(__filename).replace('.js', '');

    const res = await _.requestXML(url);
    const first = res.rss.channel.item[0];
    first.siteId = siteId;
    first.title = first.title.$cd;
    first.logoUrl = 'https://feedit.github.io/feedit-pro/app/public/images/netflix.jpg';

    if (_.isExisted(first)) {
      return;
    }

    const content = first.content$encoded.$cd;
    let $ = cheerio.load(content);
    $ = await _.translateNode(context, $);
    await _.archiveToDir(context, $, first);
  },
};
```

## Development

```bash
$ DEBUG_MODE=true node ./app/schedule/visitor.js
```

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars1.githubusercontent.com/u/1011681?v=4" width="100px;"/><br/><sub><b>xudafeng</b></sub>](https://github.com/xudafeng)<br/>|[<img src="https://avatars3.githubusercontent.com/u/1818483?v=4" width="100px;"/><br/><sub><b>ltianqi</b></sub>](https://github.com/ltianqi)<br/>
| :---: | :---: |


This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto upated at `Sun Dec 23 2018 23:28:09 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->
