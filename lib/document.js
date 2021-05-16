'use strict';

const _ = require('ooi');
const fs = require('fs');
const path = require('path');
const plugins = require('./plugins');
const jsyaml = require('js-yaml');

class YamloDocument {
  constructor(source, file) {
    let data;
    if (path.extname(file.filename) === '.js') {
      data = require(file.filename);
    } else {
      data = jsyaml.load(this.pluginsSource(source));
    }
    Object.assign(this, data);
    Object.defineProperty(this, '__file', {
      value: file,
      enumarable: false,
    });

    this.load();
  }

  require(...args) {
    return require(...args);
  }

  get(key = null) {
    return _.get(this, key);
  }

  set(key, value) {
    _.set(this, key, value);
  }

  pluginsSource(source) {
    plugins.forEach(plugin => {
      source = plugin.getSource(source, this);
    });
    return source;
  }

  getData() {
    return JSON.parse(JSON.stringify(this));
  }

  getContext() {
    let context = {
      self: this,
    };
    plugins.forEach(plugin => {
      _.extend(context, plugin.getContext(this));
    });
    return context;
  }

  callBefore() {
    plugins.forEach(plugin => {
      plugin.beforeEvaluation(this);
    });
  }

  callAfter() {
    plugins.forEach(plugin => {
      plugin.afterEvaluation(this);
    });
  }

  evaluate() {
    let flat = _.flatten(this || {}, null, true);
    _.each(flat, (val, name) => {
      if (!Array.isArray(val)) return;
      let len = val.length;
      val = _.flatten({ length: len, ...val }, null, false);
      _.set(flat, name, val);
    });
    flat = _.flatten(flat);
    _.each(flat, (val, name) => {
      if (typeof val !== 'string') return;
      let value = val.replace(/\$\{([\s\S]+?)\}/gim, (text, code) => {
        let context = this.getContext(),
          fn = new Function(`return ${code};`);
        return fn.call(this);
      });
      _.set(this, name, value);
    });
  }

  load() {
    this.callBefore();
    this.evaluate();
    this.callAfter();
  }
}

module.exports = YamloDocument;
