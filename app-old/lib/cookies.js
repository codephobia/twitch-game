const electron = require('electron');
const session = electron.session;
const ipc = electron.ipcMain;
const async = require('async');

function init() {
    ipc.on('get-cookie', ipcGetCookie);
    ipc.on('set-cookie', ipcSetCookie);
}

function ipcGetCookie(e, name) {
    async.waterfall([
        function (waterfallCb) {
            getCookie(name, function (err, cookies) {
                if (err) {
                    return waterfallCb(err);
                }
                
                return waterfallCb(null, cookies);
            });
        }
    ], function (err, cookies) {
        let cookie = (cookies && cookies.length) ? cookies[0] : null;
        e.sender.send('cookie', cookie);
    });
}

function ipcSetCookie(e, data) {
    setCookie(data.name, data.value);
}

function getCookie(name, cb) {
    let options = {
        domain: 'localhost',
        name: name,
    };

    session.defaultSession.cookies.get(options, cb);
}

function setCookie(name, value) {
    let cookie = {
        url: 'http://localhost/',
        domain: 'localhost',
        name: name,
        value: value,
        expirationDate: Date.now() + 60 * 60 * 24 * 1000
    };

    session.defaultSession.cookies.set(cookie, (err) => {
        if (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
        
        // TODO: REMOVE SAVE ON SET FOR FINAL APP
        save();
    });
}

function save() {
    session.defaultSession.cookies.flushStore(function () {
        // eslint-disable-next-line no-console
        console.info('[INFO] cookies written to disk');
    });
}

module.exports = {
    init: init,
    save: save,
    setCookie: setCookie,
    getCookie: getCookie,
};