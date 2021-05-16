'use strict';

const fs = require('fs');
const path = require('path');

let [dirname] = process.argv;

module.exports = fs.readdirSync(path.resolve(__dirname, dirname));
