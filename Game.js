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
    
    this.background = undefined;
    
    this.C_STATE = {
        NONE: 0,
        OUT: 1,
        FULL: 2,
        IN: 3
    };
    
    // Keys
    this.cursors;
    this.shoot;
    this.c_shoot;
};

Bionic.MainGame.prototype = {
    create: function(game) {
        // Set up game world
        this.physics.startSystem(this.physics.ARCADE);
        this.physics.gravity = true;
        this.physics.arcade.gravity.y = 250;
        
        // Set up map
        this.background = this.add.sprite(-1500, -500, 'background');
        
        Bionic.Player.spawnPlayer(game, 100, 450, 'radSpencer', 'bazooka');
        Bionic.Player.updateState(Bionic.Player.STATE.IDLE);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shoot = this.input.keyboard.addKey(Phaser.Keyboard.Z);
        this.c_shoot = this.input.keyboard.addKey(Phaser.Keyboard.X);
    },
    
    update: function() {
        Bionic.Player.checkControls(this.game, this.cursors, Bionic.time);
        Bionic.time += 1;
        Bionic.Player.Draw();
        Bionic.Player.gun.rotation = this.physics.arcade.angleToPointer(Bionic.Player.gun);
        
    }
    
};

Bionic.Player = {
    // Player Properties
    sprite: undefined,
    facing: 'right',
    scale: 2,
    currState: undefined,
    moveSpeed: 200,
    // Gun and Grapple
    gun: undefined,
    gunScale: 0.05,
    bullets: undefined,
    fireRate: 5,
    nextFire: 0,
    
    STATE: {
        IDLE: 0,
        WALK : 1
    },

    spawnPlayer: function(game, x, y, sprite, gunSprite){
        // Game Sprite
        this.sprite = game.add.sprite(x, y, sprite);
        this.sprite.animations.add('idle', [0]);
        this.sprite.animations.add('walk', [1, 2]);
        this.sprite.anchor.setTo(0.5, 1);
        // Physics
        game.physics.enable(this.sprite, game.physics.ARCADE);
        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.friction = 20;
        this.sprite.body.mass = 100;
		// Gun / Bullets
        this.gun = game.add.sprite(x, y, gunSprite);
        game.physics.enable(this.gun, game.physics.ARCADE);
        this.gun.body.allowGravity = false;
        this.gun.scale.x = this.gun.scale.y = this.gunScale;
        this.gun.anchor.setTo(0.2, 0.5);
        this.bullets = game.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = game.physics.ARCADE;
        this.bullets.createMultiple(50, 'bullet');
        this.bullets.setAll('checkWorldBounds', true);
        this.bullets.setAll('outOfBoundsKill', true);	
        this.bullets.body.setAll('allowGravity', false);
    },
    
    Draw: function(){
    	// Update Gun's position
    	this.gun.x = this.sprite.x - 10;
    	this.gun.y = this.sprite.y - 30;
    	
    	if (this.gun.rotation < -1.5 || (this.gun.rotation < 3 && this.gun.rotation < 2)) {
    		this.facing = 'left'; 
    		this.gun.scale.y = -this.gunScale;
    		//this.gun.x -= 35;
    	}
    	if (this.gun.rotation > -1.4 && this.gun.rotation < 2) {
    		this.facing = 'right';
    		this.gun.scale.y = this.gunScale;
    		//this.gun.x -= 35;
    	}
    	
    	// Update Animation according to State
    	switch (this.currState)
        {
            case this.STATE.IDLE:
                this.sprite.animations.play('idle', 10, true);
                break;
            case this.STATE.WALK:
                this.sprite.animations.play('walk', 10, true);
                break;
        }
        
        // Switch Direction facing
        switch (this.facing)
        {
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
    
    checkControls: function(game, cursors, time) {
    	//if (this.sprite.body.velocity.x > this.maxSpeed || this.sprite.body.velocity.x <>)
    	
        // Check for movement depending on state
        switch (this.currState)
        {
            case this.STATE.IDLE:
            	// Walk Left
            	if (cursors.left.isDown) {
            		this.facing = 'left';
            		this.sprite.body.velocity.x = -this.moveSpeed;
            		this.updateState(this.STATE.WALK);
        		}
        		// Walk Right
                if (cursors.right.isDown) {
                	this.facing = 'right';
                	this.sprite.body.velocity.x = this.moveSpeed;
                	this.updateState(this.STATE.WALK);
            	}
            	// Shoot
            	if (game.input.activePointer.isDown){
            		this.fire(game, time);
            	}
                break;
            case this.STATE.WALK:
            	// Switch Left
                if (cursors.left.isDown) {
            		this.facing = 'left';
            		this.sprite.body.velocity.x = -this.moveSpeed;
        		}
        		// Switch Right
                if (cursors.right.isDown) {
                	this.facing = 'right';
                	this.sprite.body.velocity.x = this.moveSpeed;
            	}
            	// Stop Walking
            	if (cursors.left.isUp && cursors.right.isUp){
            		//this.sprite.body.acceleration.x = 0;
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
	scale: 2,
	
	spawnEnemy: function(game, x, y, sprite){
		this.sprite = game.sprite.add(x, y, sprite);
	},

};



    /*    this.player.claw = this.add.sprite(-200, -200, 'clawSheet');
    
    */