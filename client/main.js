// electron
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const debug = require('./lib/debug');

// node
const path = require('path');
const url = require('url');

// app
const oauth = require('./lib/oauth');
const cookies = require('./lib/cookies');

// main window
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        title: app.getName(),
        width: 800,
        height: 600,
        frame: false,
        show: false,
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    debug.init(mainWindow);
    oauth.init(mainWindow);
    cookies.init();

    mainWindow.on('ready-to-show', function () {
        mainWindow.show();
    });

    mainWindow.on('closed', function () {
        mainWindow = null;

        // save cookies to disk
        cookies.save();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
