"use strict"

const path = require('path');
const url = require('url');
const {app, BrowserWindow} = require('electron');

let win;

const createWindow = () =>{
    
    win = new BrowserWindow();

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      }));
    
    
      win.on('closed', () => {
        win = null
      });
}


//create window when app is ready
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  
  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });