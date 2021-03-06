'use strict';

const path = require('path');
const dotenv = require('dotenv');

const { DEBUG_MODE } = process.env;

if (DEBUG_MODE) {
  dotenv.config();
} else {
  dotenv.config({
    path: path.resolve(__dirname, '..', '.env.prod'),
  });
}

console.log(process.env);

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1532324805616_3743';

  // add your config here
  config.middleware = [];

  config.feedit = {
    dingtalk: {
      robotUrl: process.env.WEBHOOK_URL,
    },
    site: {
      baseUrl: process.env.BASE_URL || 'http://xdf.me/feedit-pro',
    },
    autoTranslation: !DEBUG_MODE,
    rootDir: process.env.FEEDIT_ROOT_DIR || process.env.HOME,
  };

  config.yuque = {
    gateway: 'https://www.yuque.com/api/v2',
    accessToken: process.env.YUQUE_PRIVATE_TOKEN,
    user: 'xudafeng',
    repo: 'technology-frontier',
  };

  return config;
};
