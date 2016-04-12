// Main Menu

var Bionic = Bionic || {};

Bionic.MainMenu = function(game) {};
Bionic.MainMenu.prototype = {
  create: function(){
    var style = { font: "bold 64px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
    this.text = this.game.add.text(455, 250, "Alien Commander", style);
    this.text = this.game.add.text(460, 350, "Click to continue", style);
  },
  
  update: function(){
    if (this.game.input.activePointer.isDown)
      {
        this.state.start('MainGame');
      }
  }
};