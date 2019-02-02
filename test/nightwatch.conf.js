const gecko = require("geckodriver");
const selenium = require("selenium-server");
const chrome = require("chromedriver");

require('events').EventEmitter.defaultMaxListeners = 100;
//const geckodriver = require("geckodriver");
module.exports = (function (settings) {
//    console.log('Firefox Path:\r\n', gecko.path);
//  settings.test_workers = false;
//  settings.test_settings.chrome.webdriver.server_path = chrome.path;
//  settings.test_settings.firefox.webdriver.server_path = gecko.path;
  return settings;
})(require("./nightwatch.json"));
