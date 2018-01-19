'use strict';

var async = require('async');
var ObjectID = require('mongodb').ObjectID;

module.exports = function(Lobby) {
    // create lobby and add to lobby server
    Lobby.createLobby = function(req, gameId, lobbyName, isPublic, userId, cb) {
        // TODO: REMOVE USERID
        userId = userId || req.accessToken.userId.toString();
        
        async.waterfall([
            // get game data
            function (waterfallCb) {
                var Game = Lobby.app.models.Game;
                
                Game.findOne({ where: { id: ObjectID(gameId) } }, function (err, data) {
                    if (err) {
                        return waterfallCb(err);
                    }
                    
                    return waterfallCb(null, data.name, data.slotsMin, data.slotsMax);
                });
            },
            // create lobby on database
            function (gameName, gameSlotsMin, gameSlotsMax, waterfallCb) {
                // generate lobby code
                var lobbyCode = generateLobbyCode();
                
                Lobby.create({
                    gameId: ObjectID(gameId),
                    name: lobbyName,
                    code: lobbyCode,
                    public: isPublic,
                }, function (err, data) {
                    if (err) {
                        return waterfallCb(err);
                    }
                    
                    return waterfallCb(null, gameName, gameSlotsMin, gameSlotsMax, data.id.toString(), lobbyCode);
                });
            },
            // create lobby on server
            function(gameName, gameSlotsMin, gameSlotsMax, lobbyId, lobbyCode, waterfallCb) {
                var LobbyServer = Lobby.app.models.LobbyServer;
                
                // eslint-disable-next-line no-unused-vars
                LobbyServer.createLobby(lobbyId, lobbyName, lobbyCode, isPublic, userId, gameId, gameName, gameSlotsMin, gameSlotsMax, function(err, data) {
                    if (err) {
                        return waterfallCb(err);
                    }
                    
                    return waterfallCb(null, lobbyId);
                });
            }
        ], function (err, lobbyId) {
            if (err) {
                return cb(err);
            }
            
            // return lobby id
            return cb(null, lobbyId);
        });
    };
    
    // create lobby and add to lobby server
    Lobby.remoteMethod('createLobby', {
        description: 'Creates a lobby, and fires it up on the lobby server',
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'gameId', type: 'string', http: { source: 'form' }, required: true },
            { arg: 'lobbyName', type: 'string', http: { source: 'form' }, required: true },
            { arg: 'public', type: 'boolean', http: { source: 'form' }, required: true },
            // TODO: REMOVE USERID
            { arg: 'userId', type: 'string', http: { source: 'form' } }
        ],
        http: { verb: 'post', path: '/createLobby' },
        returns: { arg: 'lobbyId', type: 'string' }
    });
};

function generateLobbyCode() {
    var code = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var codeLength = 4;
    
    for (var i = 0; i < codeLength; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
}