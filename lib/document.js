/* eslint-disable */
// @ts-nocheck

'use strict';

require('ooi/polyfills');

const _ = require('ooi');
const path = require('path');
const jsyaml = require('js-yaml');
const util = require('util');
const File = require('./file');

class XyamlDocument {
  constructor(src, file) {
    this.defineProps(src, file);
    Object.assign(
      this,
      path.extname(file.filename) === '.js'
        ? require(file.filename)
        : jsyaml.load(this.__source)
    );
    this.load();
  }

  parseFunctions(source) {
    let fnReg =
      /^(?<indent>[\n]*)(?<name>[^\:]+)\:?\s*\((?<args>[^\)]+)\)\s*\=\>\s*\{(?<body>[\s\S]+?)\s*\n\s*\}\;\s*$/gim;
    return source.replace(fnReg, (...args) => {
      let fnKey = _.uniqueId('fn-'),
        opts = args.pop();
      this.__functions[fnKey] = scope => {
        let scopeNames = _.keys(scope),
          scopeValues = _.values(scope),
          fnArgs = [
            ...scopeNames,
            ...opts.args.split(',').map(arg => arg.trim()),
            opts.body,
          ],
          fn = new Function(...fnArgs);
        return (...args) => {
          return fn(...scopeValues, ...args);
        };
      };
      return `${opts.indent}${opts.name}: ^\{${fnKey}\}`;
    });
  }

  defineProps(src, file) {
    let functions = {},
      actions = [];
    Object.defineProperties(this, {
      __functions: {
        value: functions,
        enumarable: false,
      },
      __actions: {
        value: actions,
        enumarable: false,
      },
      __file: {
        value: file,
        enumarable: false,
      },
    });
    let source = this.parseFunctions(src);
    Object.defineProperties(this, {
      __source: {
        value: source,
        enumarable: false,
      },
    });
  }

  get self() {
    return this;
  }

  inspect(key) {
    let data = this.get(key);
    return util.inspect(data, { depth: 10000 });
  }

  require(...args) {
    return require(...args);
  }

  get(key = 'root') {
    if (!key.startsWith('root')) {
      key = `root.${key}`;
    }
    return _.get(
      {
        root: this,
      },
      key
    );
  }

  set(key, value) {
    _.set(this, key, value);
  }

  getData() {
    return JSON.parse(JSON.stringify(this));
  }

  getContext(ctx = {}) {
    let context = {
      ...ctx,
    };
    return context;
  }

  getLocals(name) {
    let key = `root.${name}`,
      parentKey = key.split('.').slice(0, -1).join('.'),
      data = this.get(parentKey);
    return { ...data };
  }

  getScope(name) {
    let scope = {
      self: this,
      ...this.getLocals(name),
    };
    Object.setPrototypeOf(scope, this);
    return scope;
  }

  delete(...names) {
    let flat = _.flatten(this, null, true),
      data = this.getData();
    _.each(data, (value, name) => {
      delete this[name];
    });
    names.forEach(name => {
      delete flat[name];
    });
    _.extend(this, _.flatten.unflatten(flat, null, true));
  }

  include(name, val) {
    if (val.startsWith('http://') || val.startsWith('https://')) {
      let file = new File(val),
        doc = file.getDocument(),
        data = doc;
      let container = _.get(this, name) || this;
      _.extend(container, data);
      name ? _.set(this, name, data) : '';
      return;
    }
    if (path.extname(val.split(' ')[0]) === '.js') {
      let [moduleFile, ...args] = val.split(' '),
        filename = this.__file.resolve(moduleFile),
        file = new File(filename),
        argv = [...process.argv];
      process.argv = args;
      let data = require(filename);
      process.argv = argv;
      let container = _.get(this, name);
      _.extend(data, container);
      _.set(this, name, data);
      return;
    }
    let filename = this.__file.resolve(val),
      file = new File(filename),
      data = file.getDocument(),
      container = _.get(this, name);
    _.extend(data, container);
    _.set(this, name, data);
  }

  import(name, val) {
    if (path.extname(val.split(' ')[0]) === '.js') {
      let [moduleFile, ...args] = val.split(' '),
        filename = this.__file.resolve(moduleFile),
        file = new File(filename),
        argv = [...process.argv];
      process.argv = args;
      let result = require(filename);
      process.argv = argv;
      _.set(this, name, result);
      return;
    }
    let filename = this.__file.resolve(val),
      file = new File(filename),
      data = file.getDocument();
    _.set(this, name, data);
  }

  evaluate() {
    let self = this;

    _.each(_.flatten(this, null, true), (val, name) => {
      if (name.endsWith('~include')) {
        let vals = Array.isArray(val) ? val : [val];
        vals.forEach(val => {
          let parentName = name.slice(0, -9);
          this.delete(name);
          this.include(parentName, val);
        });
      }
    });

    _.each(_.flatten(this, null, true), (val, name) => {
      if (typeof val === 'string' && val.startsWith('~import')) {
        val = val.slice(8);
        this.import(name, val);
      }
    });

    _.each(_.flatten(this, null, true), (val, name) => {
      if (name === 'eval' || name.endsWith('.eval')) {
        let codes = Array.isArray(val) ? val : [val];
        this.__actions.push(() => {
          codes.forEach(code => {
            _.expression(code, this.getScope(name));
          });
        });
        this.delete(name);
      }
    });

    _.each(_.flatten(this, null, true), (val, name) => {
      if (
        `${val || ''}`.trim().startsWith('^{') &&
        `${val || ''}`.trim().endsWith('}') &&
        `${val || ''}`.trim().split('{').length === 2
      ) {
        let fnName = val.slice(2, -1),
          fn = this.__functions[fnName];
        _.set(self, name, fn(this.getScope(name)));
      }
    });

    _.each(_.flatten(this, null, true), (val, name) => {
      if (typeof val === 'string') {
        if (
          `${val || ''}`.trim().startsWith('${') &&
          `${val || ''}`.trim().endsWith('}') &&
          `${val || ''}`.trim().split('{').length === 2
        ) {
          let value = _.expression(
            `${val || ''}`.trim().slice(2, -1),
            this.getScope(name)
          );
          _.set(self, name, value);
        } else {
          let value = evaluate(val, this.getScope(name));
          _.set(self, name, value);
        }
      } else if (Array.isArray(val)) {
        let value = val.map(val => {
          if (
            `${val || ''}`.trim().startsWith('${') &&
            `${val || ''}`.trim().endsWith('}') &&
            `${val || ''}`.trim().split('{').length === 2
          ) {
            let value = _.expression(
              `${val || ''}`.trim().slice(2, -1),
              this.getScope(name)
            );
            return value;
          }
          return evaluate(val, this.getScope(name));
        });
        _.set(self, name, value);
      }
    });

    _.each(_.flatten(this, null, true), (val, name) => {
      if (
        `${val || ''}`.trim().startsWith('${') &&
        `${val || ''}`.trim().endsWith('}') &&
        `${val || ''}`.trim().split('{').length === 2
      ) {
        let value = _.expression(
          `${val || ''}`.trim().slice(2, -1),
          this.getScope(name)
        );
        _.set(self, name, value);
      }
    });

    this.__actions.forEach(action => action());

    function evaluate(val, scope) {
      return val.replace(/\$\{(?<code>[^\}]+)\}/gim, (...args) => {
        let opts = args.pop(),
          result = _.expression(opts.code, scope);
        return result;
      });
    }
  }

  eval(name = 'root', code) {
    return _.expression(code, this.getScope(name));
  }

  load() {
    this.evaluate();
  }
}

module.exports = XyamlDocument;
