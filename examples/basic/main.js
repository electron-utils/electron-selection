'use strict';

const {app, BrowserWindow} = require('electron');
const selection = require('../../index');

let win1, win2;

app.on('ready', function () {
  win1 = new BrowserWindow({
    x: 100,
    y: 100,
    width: 600,
    height: 600,
  });
  win1.loadURL('file://' + __dirname + '/win1.html');

  win2 = new BrowserWindow({
    x: 710,
    y: 100,
    width: 400,
    height: 300,
  });
  win2.loadURL('file://' + __dirname + '/win2.html');

  selection.register('normal');
});
