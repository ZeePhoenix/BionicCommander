// MAIN GAME STATE
/*globals Phaser */
var Bionic = Bionic || {};

Bionic.MainGame = function() {
	Bionic.score = 0;
	Bionic.scoreText;
	// Time
	Bionic.time = 0;
	Bionic.spawnDealy = 500;
	
	// Eenemy
	Bionic.bats = [];
	Bionic.batSprites = undefined;
	Bionic.eyes = [];
	Bionic.eyeSprites = undefined;
	Bionic.enemySpawnTime = 0;
	
	this.map = undefined;
	this.ground = undefined;
	
	// Keys
	this.cursors;
	this.z; // Firing Key
	this.x; // Melee Key

	// Game States
	Bionic.STATE = {
		waiting: 0,
		inPlay: 1,
		dead: 2,
		reset: 3
	};
	Bionic.currState;
	
	this.bat;
};

Bionic.MainGame.prototype = {
	create: function(game) {
		// Set up game world
		Bionic.currState = Bionic.STATE.waiting;
		this.physics.startSystem(this.physics.ARCADE);
		this.physics.gravity = true;
		this.physics.arcade.gravity.y = 250;
		Bionic.g = game;
		// Set up map
		this.background = this.add.tileSprite(0, 0, 1600, 1600, 'background');
		this.map = this.game.add.tilemap('level');
		this.map.addTilesetImage('phase-2', 'tileSet');
		this.map.setCollisionByExclusion([7, 207]);
		this.groundLayer = this.map.createLayer('Ground');
		//this.map.setCollision('Ground', true);
		this.groundLayer.resizeWorld();
		
		// Set up Player
		Bionic.Player.spawnPlayer(game, 100, 650, 'hero');
		Bionic.Player.updateState(Bionic.Player.STATE.IDLE);
		this.game.camera.follow(Bionic.Player.sprite);
		
		// HUD
		Bionic.scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

		// Create Keys
		this.cursors = this.input.keyboard.createCursorKeys();
		this.z = this.input.keyboard.addKey(Phaser.Keyboard.Z);
		this.x = this.input.keyboard.addKey(Phaser.Keyboard.X);
		
		// Enemies
		//Bionic.eyeSprites = this.game.add.group();
		Bionic.batSprites = this.game.add.group();
		
		for (i = 0; i < 10; i++) {
			this.bat = new Bionic.Bat(this.game, (i * 32)+ 100, 200, 'bat', 0.2, Bionic.bats);
			this.bat.init(this.game, Bionic.Player.sprite);
		}
		//this.eye = Bionic.Eye(this.game, 400, 400, 'eye', 0.2, Bionic.eyes);
		//this.eye.init(this.game, Bionic.Player.sprite);
	},

	update: function() {
		switch (Bionic.currState) {
			case Bionic.STATE.waiting:
				Bionic.currState = Bionic.STATE.inPlay;
				break;
			case Bionic.STATE.inPlay:
				Bionic.time += 1;
				// Collisions
				this.game.physics.arcade.collide(Bionic.Player.sprite, this.groundLayer);
				this.game.physics.arcade.collide(Bionic.Player.bullets, this.groundLayer);
				

				// Player
				Bionic.Player.update(this.game, this.cursors, this.z, this.x, Bionic.time, Bionic.bats);
				Bionic.Player.Draw();
				
				// Enemies
				for (i = 0; i < 10; i++) {
					Bionic.bats[i].update();
					Bionic.bats[i].move(Bionic.Player.sprite);
					this.game.physics.arcade.collide(Bionic.batSprites);
					this.game.physics.arcade.collide(Bionic.batSprites, this.groundLayer);
					this.game.physics.arcade.overlap(Bionic.Player.bullets, Bionic.batSprites, Bionic.bulletKill, null, this);
					
					if (this.checkOverlap(Bionic.Player.sprite, Bionic.bats[i].sprite)) {
						Bionic.meleeKill(Bionic.Player, Bionic.bats[i].sprite)
					}
				}
				
				//Bionic.bats.forEach(Bionic.Bat.update);
				//Bionic.bats.forEach(Bionic.Bat.move(Bionic.Player.sprite));
				
				//Bionic.eyes[0].update();
				//Bionic.eyes[0].move(Bionic.Player.sprite);
				
				// Revive dead enemies
				if (Bionic.enemySpawnTime < Bionic.time && Bionic.batSprites.countDead() > 0) {
					var b = Bionic.batSprites.getFirstDead();
					b.revive();
					b.reset(Math.random(0, 1000), -50);
				}
				break;
			case Bionic.STATE.dead:
				break;
			case Bionic.STATE.reset:
				break;
		}

	},

	render: function() {
		//this.game.debug.bodyInfo(Bionic.Player.sprite, 32, 32);
		//this.game.debug.body(Bionic.Player.sprite);
		//this.game.debug.body(Bionic.enemies[0].sprite);
		//this.game.debug.body(Bionic.Player.bullets);
	},

	/*addOnePlatform: function(x, y) {
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
	},*/
	
	checkOverlap: function(A, B) {
		var boundsA = A.getBounds();
		var boundsB = B.getBounds();
		
		return Phaser.Rectangle.intersects(boundsA, boundsB);
	},

};

inheritsFrom = function(child, parent){
	child.prototype = Object.create(parent.prototype);
};

Bionic.bulletKill = function(target, bullet) {
	Bionic.enemySpawnTime = (Bionic.time + Bionic.spawnDealy) * Math.random(0.5, 1.5);
	bullet.kill();
	target.reset(0, -20);
	target.kill();
	Bionic.score += 5;
	Bionic.scoreText.text = "Score: " + Bionic.score;
};
Bionic.hitWall = function(bullet, target) {
	bullet.kill();
};
Bionic.meleeKill = function(player, target) {
	if (Bionic.Player.melee) {
		target.kill();
		Bionic.score += 5;
		Bionic.scoreText.text = "Score: " + Bionic.score;
	}
};