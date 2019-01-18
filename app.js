'use strict';

const createYuqueClient = require('./app/core/yuque');

module.exports = app => {
  app.yuqueClient = createYuqueClient(app.config.yuque, app);
};
