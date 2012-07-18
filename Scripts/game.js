(function($, window) {
    var MAP_WIDTH = 15,
        MAP_HEIGHT = 13,
        TILE_SIZE = 32,
        keyState = {},
        prevKeyState = {};

    window.Game.Engine = function(assetManager) {
        this.assetManager = assetManager;
        this.map = new window.Game.Map(MAP_WIDTH, MAP_HEIGHT, TILE_SIZE);
        this.sprites = [];
        this.inputManager = {
            isKeyDown: function(key) {
                return keyState[key] === true;
            },
            isKeyUp: function(key) {
                return keyState[key] === false;
            },
            isHoldingKey: function(key) {
                return prevKeyState[key] === true &&
                       keyState[key] === true;
            },
            isKeyPress: function(key) {
                return prevKeyState[key] === false &&
                       keyState[key] === true;
            },
            isKeyRelease: function(key) {
                return prevKeyState[key] === true &&
                       keyState[key] === false;
            }
        };

        keyState[window.Game.Keys.UP] = false;
        keyState[window.Game.Keys.DOWN] = false;
        keyState[window.Game.Keys.LEFT] = false;
        keyState[window.Game.Keys.RIGHT] = false;
        keyState[window.Game.Keys.A] = false;

        prevKeyState[window.Game.Keys.UP] = false;
        prevKeyState[window.Game.Keys.DOWN] = false;
        prevKeyState[window.Game.Keys.LEFT] = false;
        prevKeyState[window.Game.Keys.RIGHT] = false;
        prevKeyState[window.Game.Keys.A] = false;

        this.types = {
            GRASS: 0,
            WALL: 2,
            BRICK: 3,
        };

    var s = "222222222222222" +
            "200000000000002" +
            "202020202020202" +
            "200000000000002" +
            "202020202020202" +
            "200000000000002" +
            "202020202020202" +
            "200000000000002" +
            "202020202020202" +
            "200000000000002" +
            "202020202020202" +
            "200000000000002" +
            "222222222222222";

        this.map.fill(s);
        
        // Initialize the bomber
        var bomber = new window.Game.Bomber();
        bomber.moveTo(1, 1);
        this.addSprite(bomber);
    };

    window.Game.Engine.prototype = {
        onKeydown: function (e) {
            keyState[e.keyCode] = true;
        },
        onKeyup: function (e) {
            keyState[e.keyCode] = false;
        },
        onExplosionEnd: function(x, y) {
            var randomPower = Math.floor(Math.random() * window.Game.Powerups.EXPLOSION) + window.Game.Powerups.SPEED;

            if(this.map.get(x, y) === this.types.BRICK) {
                this.map.set(x, y, this.types.GRASS);

                this.addSprite(new window.Game.Powerup(x, y, 5, randomPower));
            }
        },
        onExplosion: function(x, y) {
            for(var i = 0; i < this.sprites.length; ++i) {
                var sprite = this.sprites[i];
                if(sprite.explode && sprite.x === x && sprite.y === y) {
                    sprite.explode(this);
                }
            }
        },
        getSpritesAt: function(x, y) {
            var sprites = [];
            for(var i = 0; i < this.sprites.length; ++i) {
                var sprite = this.sprites[i];
                if(sprite.x === x && sprite.y === y) {
                    sprites.push(sprite);
                }
            }
            return sprites;
        },
        canDestroy : function(x, y) {
            var tile = this.map.get(x, y);
            return tile === this.types.BRICK || tile === this.types.GRASS;
        },
        addSprite : function(sprite) {
            this.sprites.push(sprite);
            this.sprites.sort(function(a, b) {
                return a.order - b.order;
            });
        },
        removeSprite: function(sprite) {
            var index = window.Game.Utils.indexOf(this.sprites, sprite);
            if(index !== -1) {
                this.sprites.splice(index, 1);
                this.sprites.sort(function(a, b) {
                    return a.order - b.order;
                });
            }
        },
        update : function() {
            if(this.inputManager.isKeyPress(window.Game.Keys.D)) {
                window.Game.Debugging = !window.Game.Debugging;
            }

            for(var i = 0; i < this.sprites.length; ++i) {
                var sprite = this.sprites[i];
                if(sprite.update) {
                    sprite.update(this);
                }
            }

            for(var key in keyState) {
                prevKeyState[key] = keyState[key];
            }
        },
        movable:  function(x, y) {
            if(y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                if(this.map.get(x, y) === this.types.GRASS) {
                    for(var i = 0; i < this.sprites.length; ++i) {
                        var sprite = this.sprites[i];
                        if(sprite.x === x && sprite.y === y && sprite.type === window.Game.Sprites.BOMB) {
                            return false;
                        }
                    }
                    
                    return true;
                }
            }

            return false;
        }

    };

})(jQuery, window);