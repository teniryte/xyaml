/* eslint-disable */
// @ts-nocheck

'use strict';

const _ = require('ooi');
const colors = require('colors');
const util = require('util');

const logger = {
  consoleLog: console.log.bind(console),

  inject() {
    Object.assign(console, this);
  },

  _log(args = [], type = 'log') {
    let columns = process.stdout.columns - 5,
      line = _.repeatString(' ', columns),
      date = new Date(Date.now()).toLocaleString('ru-RU').split(',')[1].trim(),
      messages = args
        .map(arg =>
          typeof arg === 'string' ? arg : util.inspect(arg, { depth: 1000 })
        )
        .map(
          (message, i) =>
            `     ${line}\n` +
            `${
              indent('#' + i + ': ' + (typeof args[i]).yellow, '   ̴̴ ').grey
            }\n` +
            `${indent(message.trim(), '   ̴̴ '.grey)}`
        );
    this.consoleLog(
      `\n`,
      `${` ${date} `.grey.bgBlack.bold} ${` ${type} `.bgBlack.bold}${
        ':'.grey
      }\n${messages.join('\n')}\n`.bgBlack
    );

    function indent(text = '', indentation = '  ') {
      return text
        .split('\n')
        .map(line => `${indentation}${line}`)
        .join('\n');
    }
  },

  log(...args) {
    return this._log(args, 'log'.white);
  },

  info(...args) {
    return this._log(args, 'info'.blue);
  },

  warning(...args) {
    return this._log(args, 'warning'.yellow);
  },

  success(...args) {
    return this._log(args, 'success]'.green);
  },

  danger(...args) {
    return this._log(args, 'danger'.red);
  },
};

module.exports = logger;
