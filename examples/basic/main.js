'use strict';

const {app, BrowserWindow} = require('electron');
const selection = require('../../index');

let win;

app.on('ready', function () {
  win = new BrowserWindow({
    center: true,
    width: 400,
    height: 300,
  });
  win.loadURL('file://' + __dirname + '/index.html');

  selection.register('normal');
});
