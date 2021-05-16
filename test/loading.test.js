/* eslint-disable no-undef */
// @ts-nocheck

const _ = require('ooi');
const path = require('path');
const xyaml = require('../lib');

describe('xyaml.loadFile', () => {
  test('loads data', () => {
    let filename = path.resolve(__dirname, 'data/data.yaml'),
      d = xyaml.loadFile(filename);
    expect(d.getData()).toEqual({
      username: 'teniryte',
      email: 'teniryte@gmail.com',
      math: { numbers: [3, 4, 5, 6, 7], sum: 99 },
      paths: {
        users: '/home',
        home: '/home/teniryte',
        work: '/home/teniryte/work',
        config: '/home/teniryte/work/config',
        packages: '/home/teniryte/work/packages',
        tools: '/home/teniryte/work/tools',
        rootPackage: '/home',
      },
      catalogs: [
        '/home/teniryte/work/tools',
        '/home/teniryte/work/packages',
        '/home/teniryte/work/projects',
      ],
      counter: [
        '/home/teniryte/work/1',
        '/home/teniryte/work/2',
        '/home/teniryte/work/3',
        '/home/teniryte/work/4',
        '/home/teniryte/work/5',
      ],
    });
  });
  test('loads functions', () => {
    let filename = path.resolve(__dirname, 'data/functions.yaml'),
      d = xyaml.loadFile(filename);
    expect(d.math.numbers).toEqual([3, 4, 5, 6, 7]);
    expect(d.math.sum).toBe(99);
    expect(d.getHello('MyName')).toBe(`Hello, MyName!`);
    expect(d.math.add(5, 6)).toBe(11);
  });

  test('loads include and import instructions', () => {
    let filename = path.resolve(__dirname, 'data/extending.yaml'),
      d = xyaml.loadFile(filename);
    expect(d.getData()).toEqual({
      name: 'extending',
      description: 'Include and import external files',
      data: {
        languages: { ru: 'Russian', en: 'English', french: 'French' },
        fruits: ['Apple', 'Banana', 'Orange', 'Lemon', 'Cherry'],
        description: 'Data container for includes and imports',
        colors: {
          red: 'Red',
          green: 'Green',
          blue: 'Blue',
          yellow: 'Yellow',
          orange: 'Orange',
          grey: 'Grey',
          violet: 'Violet',
        },
      },
    });
  });

  test('loads .json modules', () => {
    let filename = path.resolve(__dirname, 'data/extending-json.yaml'),
      d = xyaml.loadFile(filename);
    expect(d.getData()).toEqual({
      name: 'extending-json',
      description: 'Loads .json files',
      container: {
        header: { bg: '#333', size: '100px', color: '#fff' },
        menu: { bg: '#444', size: '200px', color: '#eee' },
        sidebar: { bg: '#555', size: '300px', color: '#ddd' },
        content: { bg: '#666', size: '400px', color: '#ccc' },
        footer: { bg: '#777', size: '500px', color: '#bbb' },
        package: {
          name: 'xyaml',
          version: '0.0.2',
          main: './lib/index.js',
          description: 'Extended YAML',
          keywords: [],
          homepage: 'https://github.com/teniryte/xyaml',
        },
      },
    });
  });

  test('loads .js modules', () => {
    let filename = path.resolve(__dirname, 'data/extending-js.yaml'),
      d = xyaml.loadFile(filename);
    expect(_.pick(d.getData(), ['name', 'description'])).toEqual({
      name: 'extending-js',
      description: 'Loads .js files',
    });
    expect(d.extended.files).toEqual([
      'document.js',
      'file.js',
      'index.js',
      'logger.js',
      'xyaml.js',
    ]);
    expect(d.extended.math.add(4, 5)).toBe(9);
    expect(d.extended.math.mul(5, 5)).toBe(25);
    expect(d.extended.math.sub(12, 7)).toBe(5);
    expect(d.extended.math.div(9, 3)).toBe(3);
  });

  test('loads url modules data', () => {
    let filename = path.resolve(__dirname, 'data/extending-url-data.yaml'),
      d = xyaml.loadFile(filename);
    expect(d.getData()).toEqual({
      name: 'xyaml-test',
      description: 'Load url files',
      colors: {
        primary: '#111',
        secondary: '#222',
        info: '#333',
        warning: '#444',
        success: '#555',
        danger: '#666',
        default: '#777',
        dark: '#888',
        light: '#999',
      },
      cdn: { domain: 'cdn.sencort.com', title: 'CDN - sencort.com' },
      cortMongo: {
        domain: 'mongo.sencort.com',
        tilte: 'MongoDB Admin Panel - Sencort',
      },
      corthost: { domain: 'cort.host', title: 'Cort Server' },
      iconicMonster: {
        domain: 'iconic.monster',
        title: 'SVG Icons Web Manager - iconic.monster',
      },
      config: { host: 'xyaml.sencort.com', port: 17009, static: './static' },
      extended: {
        name: 'xyaml-test',
        colors: {
          primary: '#111',
          secondary: '#222',
          info: '#333',
          warning: '#444',
          success: '#555',
          danger: '#666',
          default: '#777',
          dark: '#888',
          light: '#999',
        },
        cdn: { domain: 'cdn.sencort.com', title: 'CDN - sencort.com' },
        cortMongo: {
          domain: 'mongo.sencort.com',
          tilte: 'MongoDB Admin Panel - Sencort',
        },
        corthost: { domain: 'cort.host', title: 'Cort Server' },
        iconicMonster: {
          domain: 'iconic.monster',
          title: 'SVG Icons Web Manager - iconic.monster',
        },
        config: { host: 'xyaml.sencort.com', port: 17009, static: './static' },
      },
    });
  });

  test('load url models functions', () => {
    let filename = path.resolve(__dirname, 'data/extending-url-functions.yaml'),
      d = xyaml.loadFile(filename);
    expect(d.name).toBe('extending-url');
    expect(d.description).toBe('Load url files');
    expect(d.math.add(100, 1)).toBe(101);
    expect(d.math.mul(100, 2)).toBe(200);
    expect(d.math.sub(100, 25)).toBe(75);
    expect(d.math.div(100, 2)).toBe(50);
  });
});
