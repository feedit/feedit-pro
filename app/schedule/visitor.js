'use strict';

const {
  Subscription
} = require('egg');
const fs = require('mz/fs');
const path = require('path');

class Visitor extends Subscription {

  static get schedule() {
    // run at every 1h.
    return {
      //cron: '0 0 */1 * * *',
      cron: '*/30 * * * * *',
      type: 'worker',
      immediate: true,
    };
  }

  async subscribe() {
    console.log(new Date().toISOString());
  }

}

module.exports = Visitor;
