'use strict';

const _ = require('ooi');

const Plugin = require('../plugin');

class Include extends Plugin {
  beforeEvaluation(doc) {
    const File = require('../file');

    _.each(doc, (val, name) => {
      if (typeof val !== 'string' || !val.startsWith('~include')) return;
      let filename = doc.__file.resolve(eval(val.split(' ')[1])),
        file = new File(filename),
        data = file.getDocument();
      Object.assign(doc, data);
    });
  }

  afterEvaluation(doc) {
    let flat = _.flatten(doc || {});
    _.each(flat, (val, key) => {
      let chain = key.split('.'),
        name = chain.pop(),
        parentName = chain.join('.');
      if (name !== '~include') return;
      if (parentName) {
        let parent = doc.get(doc, parentName);
        delete parent[name];
      } else {
        delete doc[name];
      }
    });
    _.each(flat, (val, key) => {
      let chain = key.split('.'),
        name = chain.pop(),
        parentName = chain.join('.');
      if (typeof val !== 'string' || !val.startsWith('~include')) return;
      if (parentName) {
        let parent = doc.get(doc, parentName);
        delete parent[name];
      } else {
        delete doc[name];
      }
    });
  }
}

module.exports = Include;
