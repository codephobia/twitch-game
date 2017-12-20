var async = require('async');
var ObjectID = require('mongodb').ObjectID;

module.exports = function (Lobby) {
    
    // create lobby and add to lobby server
    Lobby.createLobby = function (req, gameId, lobbyName, cb) {
        var userId = req.accessToken.userId.toString();
        
        async.waterfall([
            // get game data
            function (waterfallCb) {
                var Game = Lobby.app.models.Game;
                
                Game.findOne({ where: { id: ObjectID(gameId) } }, function (err, data) {
                    if (err) {
                        return waterfallCb(err);
                    }
                    
                    return waterfallCb(null, data.name, data.slots);
                });
            },
            // create lobby on database
            function (gameName, gameSlots, waterfallCb) {
                Lobby.create({
                    gameId: ObjectID(gameId),
                    name: lobbyName
                }, function (err, data) {
                    if (err) {
                        return waterfallCb(err);
                    }
                    
                    return waterfallCb(null, gameName, gameSlots, data.id.toString());
                });
            },
            // create lobby on server
            function (gameName, gameSlots, lobbyId, waterfallCb) {
                var LobbyServer = Lobby.app.models.LobbyServer;
                
                LobbyServer.createLobby(lobbyId, lobbyName, userId, gameId, gameName, gameSlots, function (err, data) {
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
            { arg: 'lobbyName', type: 'string', http: { source: 'form' }, required: true }
        ],
        http: { verb: 'post', path: '/createLobby' },
        returns: { arg: 'lobbyId', type: 'string' }
    });
};