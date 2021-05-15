'use strict';

const _ = require('ooi');

const Plugin = require('../plugin');

class Import extends Plugin {
  beforeEvaluation(doc) {
    const File = require('../file');

    _.each(doc, (val, name) => {
      if (!(val + '').startsWith('~import')) return;
      let filename = doc.__file.resolve(eval(val.split(' ')[1])),
        file = new File(filename),
        data = file.getDocument();
      _.set(doc, name, data);
    });
  }
}

module.exports = Import;
