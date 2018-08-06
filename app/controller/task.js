'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('../helper');

const {
  chalk,
  moment,
} = _;

const ruleDir = path.join(__dirname, '..', '..', 'config', 'rules');

module.exports = async () => {
  const list = fs
    .readdirSync(ruleDir)
    .filter(i => path.extname(i) === '.js');

  for (let i = 0; i < list.length; i++) {
    const siteId = list[i];
    const configFile = path.join(ruleDir, siteId);
    const config = require(configFile);
    console.log(chalk.green(`task [${siteId}] start at: ${_.moment().format('YY-MM-DD HH:mm:ss')}`));
    try {
      await config.run();
    } catch (e) {
      console.log(e.stack);
    }
    console.log(chalk.red(`task [${siteId}]   end at: ${_.moment().format('YY-MM-DD HH:mm:ss')}`));
  }
};
