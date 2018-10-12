const electron = require('electron');
const Menu = electron.Menu;
const debugMenu = require('debug-menu');

function init (win) {
    const dbugMenu = Menu.buildFromTemplate([{
        label: 'Debug',
        submenu: debugMenu.windowDebugMenu(win)
    }]);

    if (process.platform !== 'darwin') {
        win.setMenu(dbugMenu);
    } else {
        electron.Menu.setApplicationMenu(dbugMenu);
    }
}

module.exports = {
    init: init
};