'use strict';

const _ = require('ooi');

const Plugin = require('../plugin');

class Functions extends Plugin {
  getSource(source, doc) {
    return source.replace(
      /^\s*(.+)\s*\:\s*fn\s*\((.*)\)\s*\{([\s\S]+)\}/gim,
      (text, name, args, body) => {
        let fn = new Function(
          ...args.split(',').map((arg) => arg.trim()),
          body
        );
        doc[name] = fn.bind(doc);
        return '';
      }
    );
  }
}

module.exports = Functions;
