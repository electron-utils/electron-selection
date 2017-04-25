'use strict';

const platform = require('electron-platform');
const pkgJson = require('./package.json');

let selection;
let name = `__electron_selection__`;
let msg = `Failed to require ${pkgJson.name}@${pkgJson.version}:
  A different version of ${pkgJson.name} already running in the process, we will redirect to it.
  Please make sure your dependencies use the same version of ${pkgJson.name}.`;

if ( platform.isMainProcess ) {
  if (global[name]) {
    console.warn(msg);
    selection = global[name];
  } else {
    selection = global[name] = require('./lib/index');
  }
} else {
  if (window[name]) {
    console.warn(msg);
    selection = window[name];
  } else {
    selection = window[name] = require('./lib/index');
  }
}

// ==========================
// exports
// ==========================

module.exports = selection;