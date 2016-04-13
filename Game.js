// MAIN GAME STATE
/*globals Phaser */
var Bionic = Bionic || {};

Bionic.MainGame = function() {
	Bionic.score = 0;
	Bionic.time = 0;
	Bionic.platformSpeed = 80;
	Bionic.enemies = [];

	this.background = undefined;

	// Keys
	this.cursors;
	this.w;
	this.a;
	this.s;
	this.d;
	this.k; // Firing Key
	this.l; // Melee Key

	// Game States
	Bionic.STATE = {
		waiting: 0,
		inPlay: 1,
		dead: 2,
		reset: 3
	};
	Bionic.currState;

};

Bionic.MainGame.prototype = {
	create: function(game) {
		// Set up game world
		Bionic.currState = Bionic.STATE.waiting;
		this.physics.startSystem(this.physics.ARCADE);
		this.physics.gravity = true;
		this.physics.arcade.gravity.y = 250;

		// Set up map
		this.background = this.add.tileSprite(0, 0, 1600, 1600, 'background');

		// Set up Player
		Bionic.Player.spawnPlayer(game, 250, 650, 'hero');
		Bionic.Player.updateState(Bionic.Player.STATE.IDLE);

		// Create Keys
		this.cursors = this.input.keyboard.createCursorKeys();
		this.w = this.input.keyboard.addKey(Phaser.Keyboard.W);
		this.a = this.input.keyboard.addKey(Phaser.Keyboard.A);
		this.s = this.input.keyboard.addKey(Phaser.Keyboard.S);
		this.d = this.input.keyboard.addKey(Phaser.Keyboard.D);
		this.k = this.input.keyboard.addKey(Phaser.Keyboard.Z);

		// Create Platforms
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
		this.platforms.physicsBodyType = game.physics.ARCADE;
		this.platforms.createMultiple(10, 'groundTile');
		this.platforms.setAll('checkWorldBounds', true);
		this.platforms.setAll('outOfBoundsKill', true);
		this.platforms.setAll('body.mass', 15000);
		this.platforms.setAll('body.allowGravity', false);
		this.platforms.setAll('body.bounce', false);
		this.platforms.setAll('bosy.friction', 40);
		this.platforms.setAll('immovable', true);

		// Set Platform starting positons
		for (var i = 0; i < 8; i++) {
			var platform = this.platforms.getChildAt(i);
			platform.reset((i * 200) + 25, 700 - Math.floor(Math.random() * 450));
			platform.scale.x = 8;
			platform.checkWorldBounds = true;
			platform.outOfBoundsKill = true;
			platform.events.onKilled.add(this.platformDied, this);
		}


		// ENEMY TEST
		var bat  = Bionic.Bat(this.game, 200, 200, 'bat', 0.2);
		bat.init();
		//Bionic.enemies[0].sprite.animations.add('fly');
		//Bionic.enemies[0].sprite.animations.play('fly', 15, true);


	},

	update: function() {
		switch (Bionic.currState) {
			case Bionic.STATE.waiting:
				Bionic.currState = Bionic.STATE.inPlay;
				break;
			case Bionic.STATE.inPlay:
				Bionic.time += 1;
				// Collisions
				this.game.physics.arcade.collide(Bionic.Player.sprite, this.platforms);
				//this.game.physics.arcade.collide(Bionic.Player.bullets, this.platforms); //Add method to destroy the bullets instead of colliding

				// Player
				Bionic.Player.checkControls(this.game, this.cursors, this.w, this.a, this.s, this.d, this.k, Bionic.time);
				Bionic.Player.Draw();
				// Move Platforms
				this.propogateVelocity();
				// Enemies
				Bionic.enemies[0].move();
				break;
			case Bionic.STATE.dead:
				break;
			case Bionic.STATE.reset:
				break;
		}

	},

	render: function() {
		this.game.debug.bodyInfo(Bionic.Player.sprite, 32, 32);
		this.game.debug.body(Bionic.Player.sprite);
	},

	// Add Platform to end of screen
	addOnePlatform: function(x, y) {
		var platform = this.platforms.getFirstDead();

		platform.reset(x, y);

		platform.checkWorldBounds = true;
		platform.outOfBoundsKill = true;
	},
	// Reset Platform
	platformDied: function() {
		this.addOnePlatform(1600, 800 - Math.floor(Math.random() * 450));
	},
	// Update Velociy of Platforms
	propogateVelocity: function() {
		this.platforms.forEach(function(platform, i) {
			platform.body.velocity.x = -Bionic.platformSpeed;
			platform.body.velocity.y = 0;
		}.bind(this));
	},

};


Bionic.Enemy = function(game, x, y, sprite, scale) {
	this.sprite = game.add.sprite(x, y, sprite);
	this.scale = scale;
	this.sprite.scale.x = scale;
	this.sprite.scale.y = scale;
	this.sprite.anchor.setTo(0.5, 1);
	// Add this enemy to the list of Enemies
};

Bionic.Enemy.prototype = {
	scale: 0.2,
	facing: 'left',
	sprite: undefined,
	moveSpeed: 150,
	init: function() { Bionic.enemies.push(this); },
	move: function() {},
};

inheritsFrom = function(child, parent){
	child.prototype = Object.create(parent.prototype);
};

Bionic.Bat = function(game, x, y, sprite, scale) {
	this.sprite = game.add.sprite(x, y, sprite);
	this.scale = scale;
	this.sprite.scale.x = scale;
	this.sprite.scale.y = scale;
	this.sprite.anchor.setTo(0.5, 1);
	
	inheritsFrom(Bionic.Bat, Bionic.Enemy);
	this.init = function(){
		this.sprite.animations.add('fly');
		Bionic.enemies.push(this);
		console.log("in the list");
	};
	this.move = function(){
		this.sprite.animations.play('fly', 15, true);
	};
	
	return (this);
};