/* eslint-disable */
// @ts-nocheck

'use strict';

const _ = require('ooi');
const path = require('path');
const fs = require('fs');
const url = require('url');
const downloadFileSync = require('download-file-sync');

class XyamlFile {
  constructor(filename) {
    this.filename = filename;
    this.data = {};
    this.dir = filename.startsWith('http')
      ? path.dirname(filename)
      : fs.statSync(filename).isFile()
      ? path.dirname(filename)
      : filename;
  }

  resolve(p) {
    let files = [
      path.resolve(this.dir, p),
      path.resolve(this.dir, `${p}.yaml`),
      path.resolve(this.dir, `${p}.yamlo`),
      path.resolve(this.dir, `${p}.yml`),
      path.resolve(this.dir, `${p}.json`),
      path.resolve(this.dir, `${p}.js`),
      path.resolve(this.dir, p, `index.yaml`),
      path.resolve(this.dir, p, `index.yamlo`),
      path.resolve(this.dir, p, `index.yml`),
      path.resolve(this.dir, p, `index.json`),
      path.resolve(this.dir, p, `index.js`),
    ];
    for (let i = 0; i < files.length; i++) {
      if (fs.existsSync(files[i]) && fs.statSync(files[i]).isFile())
        return files[i];
    }
    return p;
  }

  getJsDocument(data) {
    const Document = require('./document');
    let doc = new Document('', this);
    _.extend(doc, data);
    return doc;
  }

  getDocument(...args) {
    if (path.extname(this.filename) === '.js')
      return this.getJsDocument(...args);
    const Document = require('./document');
    let filename = this.resolve(this.filename),
      source = filename.startsWith('http')
        ? downloadFileSync(filename)
        : fs.readFileSync(filename, 'utf-8');
    if (filename.startsWith('http')) {
      source = source.replace(/\.\/(.+)\.yaml\s*$/gim, (txt, file) => {
        return url.resolve(filename, `${file}.yaml`);
      });
    }
    let doc = new Document(source, this);
    return doc;
  }
}

module.exports = XyamlFile;
