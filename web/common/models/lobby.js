var async = require('async');
var ObjectID = require('mongodb').ObjectID;

module.exports = function (Lobby) {
    
    // create lobby and add to lobby server
    Lobby.createLobby = function (req, gameId, name, cb) {
        var userId = req.accessToken.userId.toString();
        
        async.waterfall([
            function (waterfallCb) {
                Lobby.create({
                    gameId: ObjectID(gameId),
                    name: name
                }, function (err, data) {
                    if (err) {
                        return waterfallCb(err);
                    }
                    
                    return waterfallCb(null, data.id.toString());
                });
            },
            function (lobbyId, waterfallCb) {
                var LobbyServer = Lobby.app.models.LobbyServer;
                
                LobbyServer.createLobby(lobbyId, userId, function (err, data) {
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
            
            return cb(null, lobbyId);
        });
    };
    
    // create lobby and add to lobby server
    Lobby.remoteMethod('createLobby', {
        description: 'Creates a lobby, and fires it up on the lobby server',
        accepts: [
            { arg: 'req', type: 'object', http: { source: 'req' } },
            { arg: 'gameId', type: 'string', http: { source: 'form' }, required: true },
            { arg: 'name', type: 'string', http: { source: 'form' }, required: true }
        ],
        http: { verb: 'post', path: '/createLobby' },
        returns: { arg: 'lobbyId', type: 'string' }
    });
};