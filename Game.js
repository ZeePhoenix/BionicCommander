// MAIN GAME STATE
/*globals Phaser */
var Bionic = Bionic || {};

// ==============================
// Todo:
// 		Move Player and Enemy
// 			to new js files
// 
// 		Implement Sprites
// ==============================


Bionic.MainGame = function() {
    Bionic.score = 0;
    Bionic.time = 0;
		Bionic.platformSpeed = 80;
    
    this.background = undefined;
    
    // Keys
    this.cursors;
   	this.w;
		this.a;
		this.s;
		this.d;
	
		// Game States
		Bionic.STATE = {
			waiting: 0,
			inPlay: 1,
			dead: 2,
			reset: 3
		};
		Bionic. currState;
	
		
};

Bionic.MainGame.prototype = {
		platformCollision: function() {
				Bionic.Player.canJump = true;
		},
	
    create: function(game) {
        // Set up game world
				Bionic.currState = Bionic.STATE.waiting;
        this.physics.startSystem(this.physics.ARCADE);
        this.physics.gravity = true;
        this.physics.arcade.gravity.y = 250;
        
        // Set up map
        this.background = this.add.tileSprite(0, 0, 1600, 1600, 'background');
        
				// Set up Player
        Bionic.Player.spawnPlayer(game, 100, 450, 'Sprite', 'bazooka');
        Bionic.Player.updateState(Bionic.Player.STATE.IDLE);
        
				// Create Keys
        this.cursors = this.input.keyboard.createCursorKeys();
				this.w = this.input.keyboard.addKey(Phaser.Keyboard.W);
				this.a = this.input.keyboard.addKey(Phaser.Keyboard.A);
				this.s = this.input.keyboard.addKey(Phaser.Keyboard.S);
				this.d = this.input.keyboard.addKey(Phaser.Keyboard.D);
			
				// Create Platforms
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
				// Set the starting positons
				for (var i = 0; i < 8; i++) 
				{
					var platform = this.platforms.getChildAt(i);
					platform.reset((i * 200) + 25, 700 - Math.floor(Math.random() * 450));
					platform.scale.x = 8;
					platform.checkWorldBounds = true;
					platform.outOfBoundsKill = true;
					platform.events.onKilled.add(this.platformDied, this);
    	}
    },
    
    update: function() {
				switch (Bionic.currState)
					{
						case Bionic.STATE.waiting:						
							Bionic.currState = Bionic.STATE.inPlay;
							break;
						case Bionic.STATE.inPlay:
							Bionic.time += 1;
							// Collisions
							this.game.physics.arcade.collide(Bionic.Player.sprite, this.platforms);
							this.game.physics.arcade.collide(Bionic.Player.bullets, this.platforms); //Add method to destroy the bullets instead of colliding
							
							// Player
        			Bionic.Player.checkControls(this.game, this.cursors, this.w, this.a, this.s, this.d, Bionic.time);
        			Bionic.Player.Draw();
        			Bionic.Player.gun.rotation = this.physics.arcade.angleToPointer(Bionic.Player.gun);
							// Move Platforms
							this.propogateVelocity();
							break;
						case Bionic.STATE.dead:
							break; 
						case Bionic.STATE.reset:
							break;
					}
        
		},
	
		addOnePlatform: function(x, y) {
			var platform = this.platforms.getFirstDead();

			platform.reset(x, y);

			platform.checkWorldBounds = true;
			platform.outOfBoundsKill = true;
		},

		platformDied: function() {
			this.addOnePlatform(1600, 700 - Math.floor(Math.random() * 450));
		},
	
		propogateVelocity: function() {
    	this.platforms.forEach(function(platform, i)
			{
      	platform.body.velocity.x =  - Bionic.platformSpeed;
				platform.body.velocity.y = 0;
    	}.bind(this));
  	},
	
		
    
};

Bionic.Player = {
    // Player Properties
    sprite: undefined,
    facing: 'right',
    scale: 1,
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
        WALK : 1
    },

    spawnPlayer: function(game, x, y, sprite, gunSprite){
        // Game Sprite
        this.sprite = game.add.sprite(x, y, sprite);
				this.sprite.anchor.setTo(0.5, 1);
        // Physics
        game.physics.enable(this.sprite, game.physics.ARCADE);
        this.sprite.body.friction = 20;
        this.sprite.body.mass = 100;
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
				this.gun = game.add.sprite(x, y - 250, gunSprite);
				game.physics.enable(this.gun, game.physics.ARCADE);
        this.gun.body.allowGravity = false;
        this.gun.scale.x = this.gun.scale.y = this.gunScale;
        this.gun.anchor.setTo(0.2, 0.2);
    },
    
    Draw: function(){
			// Update Gun's position
    	this.gun.x = this.sprite.x;
    	this.gun.y = this.sprite.y - 35;
    	
    	if (this.gun.rotation < -1.5 || (this.gun.rotation < 3 && this.gun.rotation < 2)) {
    		this.facing = 'left'; 
    		this.gun.scale.y = -this.gunScale;
    	}
    	if (this.gun.rotation > -1.4 && this.gun.rotation < 2) {
    		this.facing = 'right';
    		this.gun.scale.y = this.gunScale;
    	}
    	
    	// Update Animation according to State
    	switch (this.currState) {
            case this.STATE.IDLE:
                this.sprite.animations.play('idle', 10, true);
                break;
            case this.STATE.WALK:
                this.sprite.animations.play('walk', 10, true);
                break;
        }
        
       // Switch Direction facing
       switch (this.facing) {
            case 'right':
                this.sprite.scale.x = this.scale;
                this.sprite.scale.y = this.scale;
                break;
            case 'left':
                this.sprite.scale.x = -this.scale;
                this.sprite.scale.y = this.scale;
                break;
        }
        
    },
        
    updateState: function(animationState){
        this.currState = animationState;
    },
    
    checkControls: function(game, cursors, w, a, s, d, time) {
    	//if (this.sprite.body.velocity.x > this.maxSpeed || this.sprite.body.velocity.x <>)
    	
        // Check for movement depending on state
        switch (this.currState)
        {
            case this.STATE.IDLE:
            	// Walk Left
            	if (cursors.left.isDown || a.isDown) {
            		this.facing = 'left';
            		this.sprite.body.velocity.x = -this.moveSpeed;
            		this.updateState(this.STATE.WALK);
        			}
        			// Walk Right
              if (cursors.right.isDown || d.isDown) {
              	this.facing = 'right';
                this.sprite.body.velocity.x = this.moveSpeed;
                this.updateState(this.STATE.WALK);
            	}
            	// Shoot
            	if (game.input.activePointer.isDown){
            		this.fire(game, time);
            	}
							// Jump
							if ((w.isDown || cursors.up.isDown) && (this.sprite.body.onFloor() || this.sprite.body.touching.down || this.sprite.body.blocked.down)) {
									this.sprite.body.velocity.y = -250;
							}
                break;
            case this.STATE.WALK:
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
            	if (cursors.left.isUp && cursors.right.isUp){
            		this.sprite.body.velocity.x = 0;
            		this.updateState(this.STATE.IDLE);
            	}
            	// Shoot
            	if (game.input.activePointer.isDown){
            		this.fire(game, time);
            	}
                break;
        }
        
    },
    
    fire: function(game, time){
    	if (time > this.nextFire && this.bullets.countDead() > 0)
    	{
    		this.nextFire = time + this.fireRate;
    		var bullet = this.bullets.getFirstDead();
    		bullet.reset(this.gun.x, this.gun.y);
    		game.physics.arcade.moveToPointer(bullet, 500);
    	}
    }
};

Bionic.Enemy = {
	scale: 1,
	facing: 'left',
	sprite: undefined,
	bullets: undefined,
	gun: undefined,
	
	spawnEnemy: function(game, x, y, sprite, gunSprite){
		this.sprite = game.sprite.add(x, y, sprite);
		this.sprite.anchor.setTo(0.5, 1);
		
		this.bullets = game.add.group();
    this.bullets.enableBody = true;
		this.bullets.physicsBodyType = game.physics.ARCADE;
		this.bullets.createMultiple(50, 'bullet');
		this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('tint', 0xff00ff);
		this.bullets.setAll('outOfBoundsKill', true);	
		this.bullets.setAll('body.allowGravity', false);
		this.gun = game.add.sprite(x, y - 250, gunSprite);
		game.physics.enable(this.gun, game.physics.ARCADE);
		this.gun.body.allowGravity = false;
		this.gun.scale.x = this.gun.scale.y = this.gunScale;
		this.gun.anchor.setTo(0.2, 0.2);
	},

};



    /*    this.player.claw = this.add.sprite(-200, -200, 'clawSheet');
    
    */