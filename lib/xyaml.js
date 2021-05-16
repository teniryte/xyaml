/* eslint-disable */
// @ts-nocheck

'use strict';

const jsYaml = require('js-yaml');
const File = require('./file');

class Xyaml {
  loadFile(filename) {
    let file = new File(filename);
    return file.getDocument();
  }

  dump(data) {
    return jsYaml.dump(data);
  }
}

module.exports = new Xyaml();
