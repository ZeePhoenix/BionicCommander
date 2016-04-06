// Preloader - Load game assets

var Bionic = {};

Bionic.Preloader = function(game){
    Bionic.GAME_WIDTH = 640;
    Bionic.GAME_HEIGHT = 480;
};
Bionic.Preloader.prototype = {
    preload: function(){
        this.load.image('background', 'Sprites/Background.png');
        this.load.image('groundTile', 'Sprites/tile.png');
        
        this.load.spritesheet('radSpencer', 'Sprites/radSpencer.png', 34, 36);
        this.load.spritesheet('clawSheet', 'Sprites/claw.png', 42, 32);
        this.load.image('bullet', 'Sprites/bullet.png');
        this.load.spritesheet('enemy', 'Sprites/enemy1.png', 34, 36);
    },
    create: function() {
        this.state.start('MainGame');
    }
};