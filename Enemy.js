Bionic.Enemy = function(game, x, y, sprite, scale) {
	this.sprite = game.add.sprite(x, y, sprite);
	this.scale = scale;
	this.sprite.scale.x = scale;
	this.sprite.scale.y = scale;
	this.sprite.anchor.setTo(0.5, 1);
};
Bionic.Enemy.prototype = {
	health: 100,
	score: 5,
	scale: 0.2,
	facing: 'left',
	sprite: undefined,
	
	moveSpeed: 0,
	range: 200,
	inSight: false,
	initX: undefined,
	initY: undefined,
	
	init: function() { Bionic.enemies.push(this); },
	update: function() {},
	move: function() {},
};

Bionic.Bat = function(game, x, y, sprite, scale, list) {
	inheritsFrom(Bionic.Bat, Bionic.Enemy);
	this.sprite = game.add.sprite(x, y, sprite)
	this.scale = scale;
	this.sprite.scale.x = this.scale;
	this.sprite.scale.y = this.scale;
	this.sprite.anchor.setTo(0.5, 1);

	this.init = function(game){
		this.sprite.animations.add('fly');
		game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
		this.sprite.body.allowGravity = false;
		this.sprite.body.setSize(225, 300, 0, 0);
		this.health = 30;
		this.score = 5;
		this.alive = true;
		this.moveSpeed = game.rnd.integerInRange(25, 150);
    
		Bionic.batSprites.add(this.sprite);
		list.push(this);
	};
	
	this.update = function() {
		if (!this.sprite.alive) { return; }
		// Make sure Animation is playing
		this.sprite.animations.play('fly', 15, true);
		// And facing the proper direction
		if (this.sprite.body.velocity.x >= 0) {
			this.sprite.scale.x = this.scale;
			this.sprite.scale.y = this.scale;
		}
		else {
			this.sprite.scale.x = -this.scale;
			this.sprite.scale.y = this.scale;
		}
		
	};
	
	this.move = function(target) {
		if (!this.sprite.alive) { return; }
		
		var direction = new Phaser.Point(target.x, target.y - 90);
		direction.subtract(this.sprite.body.position.x, this.sprite.body.position.y);
		direction.subtract(this.sprite.body.velocity.x, this.sprite.body.velocity.y);
    direction.setMagnitude(this.moveSpeed);
		this.sprite.body.velocity.x += direction.x;
		this.sprite.body.velocity.y += direction.y;
		
	};
	
	
	return (this);
};

// Currently Non-Functioning
Bionic.Eye = function(game, x, y, sprite, scale, list) {
  inheritsFrom(Bionic.Eye, Bionic.Enemy);
	this.sprite = game.add.sprite(x, y, sprite)
	this.scale = scale;
	this.sprite.scale.x = this.scale;
	this.sprite.scale.y = this.scale;
	this.sprite.anchor.setTo(0.5, 0.8);

	this.init = function(game){
    this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames('', 0, 9, '.png', 2), 15, true, false);
		this.sprite.animations.add('walk', Phaser.Animation.generateFrameNames('Walk/', 0, 9, '.png', 2), 15, true, false);
    this.sprite.animations.add('die', Phaser.Animation.generateFrameNames('Dead/', 0, 9, '.png', 2), 15, false, false);
		game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
		this.sprite.body.allowGravity = true;
    this.sprite.collideWorldBounds = true;
		this.sprite.body.setSize(350, 250, 0, 0);
		this.health = 30;
		this.score = 5;
		this.alive = true;
    this.moveSpeed = 200;
		this.sprite.body.velocity.x = this.moveSpeed;
		Bionic.batSprites.add(this.sprite);
		list.push(this);
	};
  
  this.update = function() {
    if (this.sprite.body.velocity.x > 0)
      this.facing = 'right';
    if (this.sprite.body.velocity.x < 0)
      this.facing = 'left';
    
    console.log(this.sprite.body.velocity.x);
    
    switch(this.facing){
      case 'left':
        this.sprite.scale.x = -this.scale;
        break;
      case 'right':
        this.sprite.scale.x = this.scale;
        break;
    }
    
    if (this.sprite.body.velocity.x === 0) {
      this.sprite.animations.play('idle');
    }
    else
      this.sprite.animations.play('walk');
  };
  
  this.move = function() {
    if(this.sprite.body.blocked.left || this.sprite.body.touching.left)
      this.sprite.body.velocity.x *= -1;
    if(this.sprite.body.blocked.right || this.sprite.body.touching.left)
      this.sprite.body.velocity.x *= -1;
    
  };
  
  return (this);
};