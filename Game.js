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
	this.k; 	// Firing Key
	this.l; 	// Melee Key

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
		Bionic.Player.spawnPlayer(game, 100, 450, 'hero');
		Bionic.Player.updateState(Bionic.Player.STATE.IDLE);

		// Create Keys
		this.cursors = this.input.keyboard.createCursorKeys();
		this.w = this.input.keyboard.addKey(Phaser.Keyboard.W);
		this.a = this.input.keyboard.addKey(Phaser.Keyboard.A);
		this.s = this.input.keyboard.addKey(Phaser.Keyboard.S);
		this.d = this.input.keyboard.addKey(Phaser.Keyboard.D);
		this.k = this.input.keyboard.addKey(Phaser.Keyboard.K);

		/*// Create Platforms
		this.platforms = game.add.group();
		this.platforms.enableBody = true;
		this.platforms.physicsBodyType = game.physics.ARCADE;
		this.platforms.createMultiple(10, 'groundTile');
		this.platforms.setAll('checkWorldBounds', true);
		this.platforms.setAll('outOfBoundsKill', true);
		this.platforms.setAll('body.mass', 15000);
		this.platforms.setAll('body.allowGravity', false);
		this.platforms.setAll('body.bounce.x', 0);
		this.platforms.setAll('body.bounce.y', 0);
		// Set Platform starting positons
		for (var i = 0; i < 8; i++) {
			var platform = this.platforms.getChildAt(i);
			platform.reset((i * 200) + 25, 700 - Math.floor(Math.random() * 450));
			platform.scale.x = 8;
			platform.checkWorldBounds = true;
			platform.outOfBoundsKill = true;
			platform.events.onKilled.add(this.platformDied, this);
		}
		*/
		
		// ENEMY TEST
		Bionic.Enemy.spawnEnemy(this.game, 200, 200, 'bat');
		Bionic.enemies[0].sprite.animations.add('fly');
		Bionic.enemies[0].sprite.animations.play('fly', 15, true);
	},

	update: function() {
		switch (Bionic.currState) {
			case Bionic.STATE.waiting:
				Bionic.currState = Bionic.STATE.inPlay;
				break;
			case Bionic.STATE.inPlay:
				Bionic.time += 1;
				// Collisions
				//this.game.physics.arcade.collide(Bionic.Player.sprite, this.platforms);
				//this.game.physics.arcade.collide(Bionic.Player.bullets, this.platforms); //Add method to destroy the bullets instead of colliding

				// Player
				Bionic.Player.checkControls(this.game, this.cursors, this.w, this.a, this.s, this.d, this.k, Bionic.time);
				Bionic.Player.Draw();
				//Bionic.Player.gun.rotation = this.physics.arcade.angleToPointer(Bionic.Player.gun);
				// Move Platforms
				//this.propogateVelocity();
				break;
			case Bionic.STATE.dead:
				break;
			case Bionic.STATE.reset:
				break;
		}

	},
	
	render: function() {
		this.game.debug.bodyInfo(Bionic.Player.sprite, 32, 32);
		//this.game.debug.body(Bionic.Player.sprite);
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
		this.addOnePlatform(1600, 700 - Math.floor(Math.random() * 450));
	},
	// Update Velociy of Platforms
	propogateVelocity: function() {
		this.platforms.forEach(function(platform, i) {
			platform.body.velocity.x = -Bionic.platformSpeed;
			platform.body.velocity.y = 0;
		}.bind(this));
	},

};

Bionic.Player = {
	// Player Properties
	sprite: undefined,
	facing: 'right',
	scale: 0.25,
	currState: undefined,
	moveSpeed: 200,
	canJump: true,
	// Gun and Grapple
	gun: undefined,
	gunScale: 0.05,
	bullets: undefined,
	fireRate: 15,
	nextFire: 0,

	STATE: {
		IDLE: 0,
		RUN: 1,
		CROUCH: 2,
		JUMP: 3,
		HURT: 4,
		FIRE: 5,
		AIM: 6,
	},

	spawnPlayer: function(game, x, y, sprite) {
		// Game Sprite
		this.sprite = game.add.sprite(x, y, sprite);
		this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames('Idle/', 0, 9, '.png', 2), 10, true, false);
		this.sprite.animations.add('run', Phaser.Animation.generateFrameNames('Run/', 0, 9, '.png', 2), 20, true, false);
		this.sprite.animations.add('crouch', Phaser.Animation.generateFrameNames('Crouch/', 0, 9, '.png', 2), 10, true, false);
		this.sprite.animations.add('jump', Phaser.Animation.generateFrameNames('Jump/', 0, 9, '.png', 2), 5, false, false);
		this.sprite.animations.add('fire', Phaser.Animation.generateFrameNames('Idle/Shoot/', 0, 9, '.png', 2), 10, true, false);
		this.sprite.anchor.setTo(0.5, 0.5);
		// Physics
		game.physics.enable(this.sprite, game.physics.ARCADE);
		this.sprite.body.setSize(250, 480, -35, 5);
		this.sprite.body.friction = 20;
		this.sprite.body.mass = 100;
		this.sprite.body.collideWorldBounds = true;
		this.sprite.body.bounce.x = this.sprite.body.bounce.y = 0;
		// Gun / Bullets
		this.bullets = game.add.group();
		this.bullets.enableBody = true;
		this.bullets.physicsBodyType = game.physics.ARCADE;
		this.bullets.createMultiple(50, 'bullet');
		this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('tint', 0xff00ff);
		this.bullets.setAll('outOfBoundsKill', true);
		this.bullets.setAll('body.allowGravity', false);
	},

	Draw: function() {
		
		// Switch Direction facing
		switch (this.facing) {
			case 'right':
				this.sprite.scale.x = this.scale;
				this.sprite.scale.y = this.scale;
				this.sprite.body.setSize(250, 480, -35, 5);
				break;
			case 'left':
				this.sprite.scale.x = -this.scale;
				this.sprite.scale.y = this.scale;
				this.sprite.body.setSize(250, 480, 35, 5);
				break;
		}
		
		// Update Animation according to State
		switch (this.currState) {
			case this.STATE.IDLE:
				this.sprite.animations.play('idle');
				break;
			case this.STATE.RUN:
				this.sprite.animations.play('run');
				break;
			case this.STATE.CROUCH:
				this.sprite.body.setSize(250, 350);
				this.sprite.animations.play('crouch');
				break;
			case this.STATE.JUMP:
				if (this.sprite.body.velocity.y === 0 && (this.sprite.body.onFloor() || this.sprite.body.touching.down || this.sprite.body.blocked.down)) {
					this.currState = this.STATE.IDLE;
				}
				else this.sprite.animations.play('jump');
				break;
		}

	},

	updateState: function(animationState) {
		this.currState = animationState;
	},

	checkControls: function(game, cursors, w, a, s, d, time) {
		//if (this.sprite.body.velocity.x > this.maxSpeed || this.sprite.body.velocity.x <>)

		// Check for movement depending on state
		switch (this.currState) {
			case this.STATE.IDLE:
				// Walk Left
				if (cursors.left.isDown || a.isDown) {
					this.facing = 'left';
					this.sprite.body.velocity.x = -this.moveSpeed;
					this.updateState(this.STATE.RUN);
				}
				// Walk Right
				if (cursors.right.isDown || d.isDown) {
					this.facing = 'right';
					this.sprite.body.velocity.x = this.moveSpeed;
					this.updateState(this.STATE.RUN);
				}
				// Shoot
				if (game.input.activePointer.isDown) {
					this.fire(game, time);
				}
				// Crouch
				if (cursors.down.isDown || s.isDown) {
					this.updateState(this.STATE.CROUCH);	
				}
				// Jump
				if ((w.isDown || cursors.up.isDown) && (this.sprite.body.onFloor() || this.sprite.body.touching.down || this.sprite.body.blocked.down)) {
					this.sprite.body.velocity.y = -250;
					this.updateState(this.STATE.JUMP);
				}
				break;
			case this.STATE.RUN:
				// Switch Left
				if (cursors.left.isDown || a.isDown) {
					this.facing = 'left';
					this.sprite.body.velocity.x = -this.moveSpeed;
				}
				// Switch Right
				if (cursors.right.isDown || d.isDown) {
					this.facing = 'right';
					this.sprite.body.velocity.x = this.moveSpeed;
				}
				// Stop Walking
				if (cursors.left.isUp && cursors.right.isUp) {
					this.sprite.body.velocity.x = 0;
					this.updateState(this.STATE.IDLE);
				}
				// Shoot
				if (game.input.activePointer.isDown) {
					this.fire(game, time);
				}
				break;
			case this.STATE.CROUCH:
				// Stand up
				if (cursors.down.isUp && s.isUp) {
					this.updateState(this.STATE.IDLE);
				}
				// Switch Left
				if (cursors.left.isDown || a.isDown) {
					this.facing = 'left';
				}
				// Switch Right
				if (cursors.right.isDown || d.isDown) {
					this.facing = 'right';
				}
		}

	},

	fire: function(game, time) {
		if (time > this.nextFire && this.bullets.countDead() > 0) {
			this.nextFire = time + this.fireRate;
			var bullet = this.bullets.getFirstDead();
			bullet.reset(this.sprite.x, this.sprite.y);
			game.physics.arcade.moveToPointer(bullet, 500);
		}
	}
};

Bionic.Enemy = {
	scale: 0.2,
	facing: 'left',
	sprite: undefined,
	moveSpeed: 150,
	enemyType: undefined,
	
	TYPE: {
		FLYER: 0,
		CRAWLER: 1,
		ATTACKER: 2
	},

	spawnEnemy: function(game, x, y, sprite, type) {
		this.sprite = game.add.sprite(x, y, sprite);
		this.sprite.scale.x = this.scale;
		this.sprite.scale.y = this.scale;
		this.sprite.anchor.setTo(0.5, 1);
		this.enemyType = type;
		
		// Add this enemy to the list of Enemies
		Bionic.enemies.push(this);
	},
	
	move: function() {
		
	},
	
};




/*    this.player.claw = this.add.sprite(-200, -200, 'clawSheet');
    
*/