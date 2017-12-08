const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const debug = require('./lib/debug');

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        title: app.getName(),
        width: 800,
        height: 600,
        frame: false
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "build", "dist", "html", "index.html"),
        protocol: 'file:',
        slashes: true
    }));

    debug.init(mainWindow);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow)

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