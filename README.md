# electron-selection

[![Linux Build Status](https://travis-ci.org/electron-utils/electron-selection.svg?branch=master)](https://travis-ci.org/electron-utils/electron-selection)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/xs18f8goees9w9bb?svg=true)](https://ci.appveyor.com/project/jwu/electron-selection)
[![Dependency Status](https://david-dm.org/electron-utils/electron-selection.svg)](https://david-dm.org/electron-utils/electron-selection)
[![devDependency Status](https://david-dm.org/electron-utils/electron-selection/dev-status.svg)](https://david-dm.org/electron-utils/electron-selection#info=devDependencies)

Global Selection

## Why?

  - Sync selection in multiple windows

## Install

```bash
npm install --save electron-selection
```

## Run Examples:

```bash
npm start examples/${name}
```

## Usage

```javascript
const selection = require('electron-selection');

selection.register('normal');
selection.select('normal', ['a', 'b', 'c', 'd']);

// ['a', 'b', 'c', 'd']
console.log(selection.curSelection('normal'));
```

## API Reference

TODO

## License

MIT © 2017 Johnny Wu
