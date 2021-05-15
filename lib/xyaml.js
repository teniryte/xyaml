'use strict';

const File = require('./file');

class Xyaml {
  loadFile(filename) {
    let file = new File(filename);
    return file.getDocument();
  }
}

module.exports = new Xyaml();
