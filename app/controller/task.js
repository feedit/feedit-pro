'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('../helper');

const ruleDir = path.join(__dirname, '..', '..', 'config', 'rules');

module.exports = async context => {
  const list = fs
    .readdirSync(ruleDir)
    .filter(i => path.extname(i) === '.js');

  for (let i = 0; i < list.length; i++) {
    const siteId = list[i];
    const configFile = path.join(ruleDir, siteId);
    const config = require(configFile);
    if (!config.enable) {
      continue;
    }
    context.logger.info(`task [${siteId}] start at: ${_.moment().format('YY-MM-DD HH:mm:ss')}`);
    try {
      await config.run(context);
    } catch (e) {
      context.logger.warn(e.stack);
    }
    context.logger.info(`task [${siteId}]   end at: ${_.moment().format('YY-MM-DD HH:mm:ss')}`);
  }
};
