'use strict';

const Import = require('./import');
const Include = require('./include');
const Functions = require('./functions');

module.exports = [new Functions(), new Import(), new Include()];
