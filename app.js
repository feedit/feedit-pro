'use strict';

const path = require('path');
const dotenv = require('dotenv');

if (process.env.DEBUG_MODE) {
  dotenv.config();
} else {
  dotenv.config({
    path: path.resolve(__dirname, '.env.prod'),
  });
}

const createYuqueClient = require('./app/core/yuque');

module.exports = app => {
  app.yuqueClient = createYuqueClient(app.config.yuque);
};
