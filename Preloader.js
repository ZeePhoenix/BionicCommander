// Preloader - Load game assets

var Bionic = {};

Bionic.Preloader = function(game) {
  Bionic.GAME_WIDTH = 640;
  Bionic.GAME_HEIGHT = 480;
};
Bionic.Preloader.prototype = {
  preload: function() {
    // Background / Map
    this.load.image('background', 'Assets/Sprites/Background.png');
    this.load.image('groundTile', 'Assets/Sprites/tile.png');
    this.load.tilemap('level', 'Assets/JSON/level (1).json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tileSet', 'Assets/Sprites/tileSet.png');

    // Player and Bullets
    this.load.image('bullet', 'Assets/Sprites/bullet.png');
    this.load.spritesheet('Sprite', 'Assets/Sprites/Sprite.png');
    this.load.atlasJSONArray('hero', 'Assets/Sprites/hero.png', 'Assets/JSON/hero.json');
    
    // Enemies
    this.load.atlasJSONArray('bat', 'Assets/Sprites/bat2.png', 'Assets/JSON/bat2.json');
    this.load.atlasJSONArray('eye', 'Assets/Sprites/eye1.png', 'Assets/JSON/eye1.json');
    
    // Sound
    this.load.audio('shot', 'Assets/Sounds/laser.wav');
    this.load.audio('bkgMusic', 'Assets/Sounds/videGame7.wav');

  },
  create: function() {
    this.state.start('MainGame');
  }
};