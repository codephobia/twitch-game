angular.module('app.directives')
    .directive('drawingGame', ['$rootScope', 'LobbyService', function ($rootScope, LobbyService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: './games/canvas.html',
            // eslint-disable-next-line no-unused-vars
            link: function(scope, el, attrs) {
                // TODO: REMOVE USERID
                var userId = $rootScope.userId;
                
                var colors = LobbyService.getColors();
                var canvas = $(el);
                var context = canvas[0].getContext('2d');
                var paint = false;
                
                var pColors = [];
                var pClicks = [];
                
                // set canvas width / height
                canvas.attr('width', window.innerWidth);
                canvas.attr('height', window.innerHeight);
                
                function init() {
                    // get players from lobby
                    var players = LobbyService.getPlayers();
                    
                    // loop through lobby players
                    for (var i = 0; i < players.length; i++) {
                        var playerId = players[i].userId;
                        
                        // determine colors for players
                        pColors[playerId] = colors[i].hex;
                        
                        // init clicks for player
                        pClicks[playerId] = [];
                    }
                }
                
                init();
                
                canvas.mousedown(function (event) {
                    paint = true;
                    
                    var mouseX = event.pageX - this.offsetLeft;
                    var mouseY = event.pageY - this.offsetTop;
                    var drag = false;
                    
                    // add local draw
                    addClick(mouseX, mouseY, drag);
                    
                    // send draw to server
                    LobbyService.gameSend('DRAW', {
                        x: mouseX,
                        y: mouseY,
                        d: drag,
                    });
                });
                
                canvas.mouseup(function () {
                    paint = false;
                });
                
                canvas.mouseleave(function () {
                    paint = false;
                });
                
                canvas.mousemove(function (event) {
                    if (!paint) {
                        return;
                    }
                    var mouseX = event.pageX - this.offsetLeft;
                    var mouseY = event.pageY - this.offsetTop;
                    var drag = true;
                    
                    // add local draw
                    addClick(mouseX, mouseY, drag);
                    
                    // send draw to server
                    LobbyService.gameSend('DRAW', {
                        x: mouseX,
                        y: mouseY,
                        d: drag,
                    });
                    
                    redraw();
                });
                
                function addClick(x, y, drag) {
                    pClicks[userId].push({
                        x: x,
                        y: y,
                        d: drag,
                    });
                }
                
                function redraw() {
                    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                    
                    // loop through all player clicks
                    for (var playerId in pClicks) {
                        var clicks = pClicks[playerId];
                        
                        context.strokeStyle = '#' + pColors[playerId];
                        context.lineJoin = 'round';
                        context.lineWidth = 5;

                        for(var i = 0; i < clicks.length; i++) {		
                            context.beginPath();

                            if(clicks[i].d && i > 0){
                                context.moveTo(clicks[i-1].x, clicks[i-1].y);
                            }else{
                                context.moveTo(clicks[i].x - 1, clicks[i].y);
                            }

                            context.lineTo(clicks[i].x, clicks[i].y);
                            context.closePath();
                            context.stroke();
                        }
                    }
                }
                
                LobbyService.gameBind('DRAW', eventDraw);
                
                function eventDraw(data) {
                    var playerId = data.userId;
                    var click = data.click;
                    
                    // don't cache clicks for current player
                    if (playerId == userId) {
                        return;
                    }
                    
                    // add click for player
                    pClicks[playerId].push(click);
                    
                    // redraw the canvas
                    redraw();
                }
                
                scope.$on('$destroy', function () {
                    LobbyService.gameUnbind('DRAW');
                });
            }
        };
    }]);