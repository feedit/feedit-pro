'use strict';

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
    autoTranslation: false,
    rootDir: process.env.FEEDIT_ROOT_DIR || process.env.HOME,
  };

  return config;
};
