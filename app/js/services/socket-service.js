angular.module('app.services')
.factory('SocketService', [function () {
    var SocketHandler = function () {
        this.conn = null;
        this.callbacks = [];
    };
    
    // open a websocket connection
    SocketHandler.prototype.connect = function (url, openCb, closeCb) {
        var self = this;
        
        openCb = openCb || function () {};
        closeCb = closeCb || function () {};

        self.conn = new WebSocket(url);

        // bind callbacks
        self.bind('open', openCb);
        self.bind('close', closeCb);
        
        // init the websocket connection
        self.initConnection();
    };
    
    // init the websocket connection
    SocketHandler.prototype.initConnection = function () {
        var self = this;
        
        // handle websocket message
        self.conn.onmessage = function (msg) {
            msg = JSON.parse(msg.data);
            
            var event = msg[0];
            var data = msg[1];
            
            // fire event
            if (self.callbacks[event] && typeof self.callbacks[event] === 'function') {
                self.callbacks[event](data);
            }
        };
        
        // handle websocket open
        self.conn.onopen = function () {
            self.callbacks['open']();
        };
        
        // handle websocket close
        self.conn.onclose = function () {
            self.callbacks['close']();
        };
    };

    // bind a callback to an event name
    SocketHandler.prototype.bind = function (event, callback) {
        var self = this;

        // validate event
        if (!event || typeof event !== 'string' || !event.length) {
            console.error("[ERROR] bind: invalid event name: ", event);
            return;
        }

        // validate callback
        if (!callback || typeof callback !== 'function') {
            console.error("[ERROR] bind: invalid callback: ", callback);
            return;
        }

        // make sure event isn't already bound
        if (self.callbacks[event]) {
            console.error("[ERROR] bind: unable to bind event: ", event);
            return;
        }

        // save the callback for the event
        self.callbacks[event] = callback;
    };

    // send event data to server
    SocketHandler.prototype.send = function (event, data) {
        var self = this;

        // validate event
        if (!event || typeof event !== 'string' || !event.length) {
            console.error("[ERROR] send: invalid event name: ", event);
            return;
        }

        // validate data
        if (!data || typeof event !== 'object') {
            console.error("[ERROR] send: invalid data: ", event);
            return;
        }

        var msg = JSON.stringify([event, data]);
        self.conn.send(msg);
    };

    // close the websocket connection
    SocketHandler.prototype.close = function (code, reason) {
        var self = this;

        code = code || 1000;
        reason = reason || 'closing connection';

        // close connection
        self.conn.close(code, reason);
    };
    
    // return avalable methods
    return {
        new: function (url, openCb, closeCb) {
            // create new handler
            var socketHandler = new SocketHandler();
            
            // connect
            socketHandler.connect(url, openCb, closeCb);
            
            // return new handler
            return socketHandler;
        }
    };
}]);