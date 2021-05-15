/* eslint-disable no-undef */
// @ts-nocheck
'use strict';

const path = require('path');
const xyaml = require('../lib');

describe('load', () => {
  it('loads', () => {
    expect(xyaml.loadFile(path.resolve(__dirname, 'data'))).toEqual({
      ui: { color: 'red', border: 1 },
      pk: {
        name: 'xyaml',
        version: '0.0.2',
        main: './lib/index.js',
        description: 'Extended YAML',
        keywords: [],
        homepage: 'https://github.com/teniryte/xyaml',
      },
      users: ['teniryte', 'teu', 'zuncou'],
      host: 'localhost',
      port: 8000,
      username: 'teniryte',
      email: 'teniryte@gmail.com',
      name: 'Remote Test',
      server: 'cdn.cort.one',
    });
  });

  it('loads functions', () => {
    expect(
      xyaml.loadFile(path.resolve(__dirname, 'data/fn.yaml')).getHello('Name')
    ).toBe('Hello, Name!');
  });
});
