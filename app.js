'use strict';

require('dotenv').config();

const createYuqueClient = require('./app/core/yuque');

module.exports = app => {
  app.yuqueClient = createYuqueClient(app.config.yuque);
};
