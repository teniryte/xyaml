'use strict';

class Plugin {
  getSource(source) {
    return source;
  }

  getContext() {
    return {};
  }

  beforeEvaluation(doc) {
    return doc;
  }

  afterEvaluation(doc) {
    return doc;
  }
}

module.exports = Plugin;
