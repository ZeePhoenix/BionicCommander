// ==================================
//          Main Game State
//     +++++++++++++++++++++++++++
//               Needs
//       Current Map
//	     Enemies + bullets
//       Player + bullets
//       Score Keeper
//       Hud Elements
//       Hidden secrets??
//       Item drops
// ==================================

Bionic.Game = function(game) {
    
    
    this._player = null;
    
    
};

Bionic.Game.prototype = {
    create: function() {
        this.physics.startSystem(Phaser.physics.ARCADE);
        this.physics.ARCADE.gravity.y = 200;
        
        this.add.sprite(0, 0, 'background');
        
        this._player = this.add.sprite(5, 500, 'radSpencer');
        this._player.animations.add('idle');
        
        
    },
    update: function() {
        
    }
};