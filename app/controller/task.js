'use strict';

const path = require('path');
const glob = require('glob');

const _ = require('xutil');

const ruleDir = path.join(__dirname, '..', '..', 'config', 'rules');

module.exports = async context => {
  const list = glob.sync('**/**.js', {
    cwd: ruleDir,
    realpath: true,
  });

  for (let i = 0; i < list.length; i++) {
    const configFile = list[i];
    const siteId = path.basename(configFile).replace('.js', '');
    const config = require(configFile);
    if (!config.enable) {
      continue;
    }
    context.logger.info(`task [${siteId}] start at: ${_.moment().format('YY-MM-DD HH:mm:ss')}`);
    try {
      await config.run.call(context);
    } catch (e) {
      context.logger.warn(e.stack);
    }
    context.logger.info(`task [${siteId}]   end at: ${_.moment().format('YY-MM-DD HH:mm:ss')}`);
  }
};
