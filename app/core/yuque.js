'use strict';

const urllib = require('urllib');

module.exports = options => {
  function Client(options) {
    this.gateway = options.gateway;
    this.accessToken = options.accessToken;
  }

  Client.prototype.invoke = async function(api, params) {
    return await urllib.request(`${this.gateway}${api}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'feedit-pro',
        'X-Auth-Token': this.accessToken,
      },
      data: params,
    });
  };

  Client.prototype.publicDoc = async function(params) {
    return await this.invoke('/repos/xudafeng/the-world-technology-frontier/docs', {
      public: 1,
      ...params,
    });
  };

  return new Client(options);
};
