// MAIN GAME STATE
/*globals Phaser */
var Bionic = Bionic || {};

Bionic.MainGame = function() {
	Bionic.score = 0;
	Bionic.scoreText;
	Bionic.healthText;
	// Time
	Bionic.time = 0;
	Bionic.spawnDealy = 500;
	Bionic.damageTime = 0;
	Bionic.damageOffset = 50;
	// Sound
	Bionic.sfx;
	Bionic.bkgSound;
	
	// Eenemy
	Bionic.bats = [];
	Bionic.batSprites = undefined;
	Bionic.eyes = [];
	Bionic.eyeSprites = undefined;
	Bionic.enemySpawnTime = 0;
	Bionic.emmiter;
	
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
		// Set up map
		this.background = this.add.tileSprite(0, 0, 1600, 1600, 'background');
		this.background.fixedToCamera = true;
		this.map = this.game.add.tilemap('level');
		this.map.addTilesetImage('phase-2', 'tileSet');
		this.map.setCollisionByExclusion([7, 207]);
		this.groundLayer = this.map.createLayer('Ground');
		this.groundLayer.resizeWorld();
		
		// Set up HUD
		Bionic.scoreText = game.add.text(16, 48, 'Score: 0', { fontSize: '32px', fill: '#000' });
		Bionic.healthText = game.add.text(16, 16, 'Health: 100', { fontSize: '32px', fill: '#000' });
		Bionic.scoreText.fixedToCamera = true;
		Bionic.healthText.fixedToCamera = true;
		
		// Set up Sound
		Bionic.sfx = game.add.audio('shot');
		Bionic.bkgSound = game.add.audio('bkgMusic');
		Bionic.bkgSound.loop = true;
		
		// Set up Emitter
		Bionic.emmiter = game.add.emitter(0, 0, 100);
		Bionic.emmiter.makeParticles('bullet');
		Bionic.emmiter.gravity = 10;
		
		// Create Keys
		this.cursors = this.input.keyboard.createCursorKeys();
		this.z = this.input.keyboard.addKey(Phaser.Keyboard.Z);
		this.x = this.input.keyboard.addKey(Phaser.Keyboard.X);
		
		// Set up Player
		Bionic.Player.spawnPlayer(game, 100, 650, 'hero');
		Bionic.Player.updateState(Bionic.Player.STATE.IDLE);
		this.game.camera.follow(Bionic.Player.sprite);
		
		// Set up Enemies
		Bionic.batSprites = this.game.add.group();
		
		for (i = 0; i < 10; i++) {
			this.bat = new Bionic.Bat(this.game, (i * 150)+ 200, -20, 'bat', 0.2, Bionic.bats);
			this.bat.init(this.game, Bionic.Player.sprite);
		}
	},

	update: function() {
		switch (Bionic.currState) {
			case Bionic.STATE.waiting:
				Bionic.bkgSound.play();
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
					//this.game.physics.arcade.collide(Bionic.batSprites);
					this.game.physics.arcade.collide(Bionic.bats[i].sprite, this.groundLayer);
					this.game.physics.arcade.overlap(Bionic.Player.bullets, Bionic.batSprites, Bionic.bulletKill, null, this);
					
					if (this.checkOverlap(Bionic.Player.sprite, Bionic.bats[i].sprite) && Bionic.bats[i].sprite.alive) {
						if (Bionic.Player.melee)
							Bionic.meleeKill(Bionic.Player, Bionic.bats[i].sprite);
						else {
							if (Bionic.damageTime < Bionic.time){	
								Bionic.Player.takeDamage(10);
								Bionic.damageTime = Bionic.time + Bionic.damageOffset;
							}
						}
						Bionic.scoreText.text = "Score: " + Bionic.score;
						Bionic.healthText.text ="Health: " + Bionic.Player.health;
					}
				}
				
				// Revive dead enemies
				if (Bionic.enemySpawnTime < Bionic.time && Bionic.batSprites.countDead() > 0) {
					Bionic.enemySpawnTime = Bionic.time + Bionic.spawnDealy;
					var b = Bionic.batSprites.getFirstDead();
					b.revive();
					b.reset(this.game.rnd.integerInRange(10, 1200), this.game.rnd.integerInRange(-20, -1200));
				}
				
				if (Bionic.Player.health <= 0)
					this.game.state.start('Preloader');
					Bionic.currState = Bionic.STATE.waiting;
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
	Bionic.emmiter.x = target.x;
	Bionic.emmiter.y = target.y;
	Bionic.emmiter.start(true, 500, null, 10);
	target.reset(0, -20);
	target.kill();
	Bionic.score += 5;
};
Bionic.hitWall = function(bullet, target) {
	bullet.kill();
};
Bionic.meleeKill = function(player, target) {
	target.kill();
	Bionic.score += 5;
	Bionic.scoreText.text = "Score: " + Bionic.score;
};