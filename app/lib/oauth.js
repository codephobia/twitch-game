const electron = require('electron');
const ipc = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const async = require('async');

var mainWindow = null;
var authWindow = null;

var cookieUrl = 'http://localhost/';
var cookieDomain = 'localhost';
var callbackUrl = 'http://localhost:3000/games';

function oauthLogin(e, data) {
    authWindow = new BrowserWindow({
        title: '',
        width: 400,
        height: 475,
        show: false,
        webPreferences: {
            nodeIntegration: false
        },
        resizable: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        //icon: 
    });
    
    authWindow.loadURL('http://localhost:3000/login/twitch');
    
    authWindow.on('closed', function () {
        e.sender.send('oauth-login-cancelled');
        mainWindow.show();
        authWindow = null;
    });
    
    authWindow.webContents.on('did-navigate', function (event, url) {
        if (url !== callbackUrl) {
            mainWindow.hide();
            authWindow.show();
        }
    });
    
    authWindow.webContents.on('did-get-redirect-request', function (event, url, newUrl) {
        // if we're not going to callback url, return out
        if (newUrl !== callbackUrl) {
            return;
        }
        
        // get cookies from request
        async.waterfall([
            function (waterfallCb) {
                var cookieName = 'userId';
                
                authWindow.webContents.session.cookies.get({
                    url: callbackUrl,
                    domain: cookieDomain,
                    name: cookieName
                }, function (err, cookie) {
                    if (err) {
                        return waterfallCb(err);
                    }
                    
                    var userId;
                    
                    // if we got a cookie, set the userId
                    if (cookie && cookie.length) {
                        userId = cookie[0].value;
                    }
                    
                    // remove the cookie
                    //authWindow.webContents.session.cookies.remove(callbackUrl, cookieName, function () {
                        return waterfallCb(null, userId);
                    //});
                });
            },
            function (userId, waterfallCb) {
                var cookieName = 'access_token';
                
                authWindow.webContents.session.cookies.get({
                    url: callbackUrl,
                    domain: cookieDomain,
                    name: cookieName
                }, function (err, cookie) {
                    if (err) {
                        return waterfallCb(err);
                    }
                    
                    var accessToken;
                    
                    // if we got a cookie, set the userId
                    if (cookie && cookie.length) {
                        accessToken = cookie[0].value;
                    }
                    
                    // remove the cookie
                    //authWindow.webContents.session.cookies.remove(callbackUrl, cookieName, function () {
                        return waterfallCb(null, userId, accessToken);
                    //});
                });
            }
        ], function (err, userId, accessToken) {
            if (err) {
                console.error(err);
                return;
            }
            
            var authInfo = {
                userId: userId,
                accessToken: accessToken
            };
            
            e.sender.send('oauth-login-reply', authInfo);
            authWindow.close();
        });
    });
}

function init(mainWnd) {
    mainWindow = mainWnd;
    
    // oauth login message
    ipc.on('oauth-login', oauthLogin);
}

module.exports = {
    init: init
};