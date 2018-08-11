'use strict';

const {
  Subscription,
} = require('egg');

const task = require('../controller/task');

class Visitor extends Subscription {

  static get schedule() {
    // run at every 1h.
    return {
      cron: '0 0 */1 * * *',
      type: 'worker',
      immediate: true,
    };
  }

  async subscribe() {
    await task(this);
  }

}

module.exports = Visitor;

if (module.parent) {
  return;
}

(async () => {
  console.log('debug mode');

  await task();
})();
