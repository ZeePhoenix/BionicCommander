// MAIN GAME STATE
/*globals Phaser */
var Bionic = Bionic || {};

Bionic.MainGame = function(game) {
    Bionic.health = 0;
    Bionic.score = 0;
    
    this.player = undefined;
    this.enemy = undefined;
    
    this.background = undefined;
    
    this.STATE = {
        IDLE: 0,
        WALK : 1,
        CROUCH: 2,
        C_CROUCH: 3,
        C_DIAGONAL: 4,
        C_UP: 5,
        SWING: 6,
        HURT: 7,
        PARACHUTE: 8,
        DEAD: 9,
    };
    
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
        
        Bionic.Player.spawnPlayer(game, 100, 450, 'radSpencer', 'clawSheet');
        Bionic.Player.updateState(this.STATE.IDLE);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shoot = this.input.keyboard.addKey(Phaser.Keyboard.x);
        this.c_shoot = this.input.keyboard.addKey(Phaser.Keyboard.x);
    },
    update: function() {
        this.checkControls();
        
        switch (Bionic.Player.currState)
        {
            case this.STATE.IDLE:
                Bionic.Player.sprite.animations.play('idle');
                Bionic.Player.sprite.body.velocity.x = 0;
                break;
            case this.STATE.WALK:
                Bionic.Player.sprite.animations.play('walk', 10, true);
                switch (Bionic.Player.facing){
                    case 'right':
                        Bionic.Player.sprite.body.velocity.x = Bionic.Player.moveSpeed;
                        break;
                    case 'left':
                        Bionic.Player.sprite.body.velocity.x = -Bionic.Player.moveSpeed;
                }
                break;
            case this.STATE.CROUCH:
                Bionic.Player.sprite.animations.play('crouch', 10, true);
                Bionic.Player.sprite.body.velocity.x = 0;
                break;
                
        }
        
        switch (Bionic.Player.facing)
        {
            case 'right':
                Bionic.Player.sprite.scale.x = 2;
                Bionic.Player.sprite.scale.y = 2;
                break;
            case 'left':
                Bionic.Player.sprite.scale.x = -2;
                Bionic.Player.sprite.scale.y = 2;
                break;
        }
    },
    
    checkControls: function() {
        // Check for movement depending on state
        switch (Bionic.Player.currState)
        {
            case this.STATE.IDLE:
            	// Walk Left
            	if (this.cursors.left.isDown) {
            		Bionic.Player.facing = 'left';
            		Bionic.Player.sprite.body.velocity.x = -Bionic.Player.moveSpeed;
            		Bionic.Player.updateState(this.STATE.WALK);
        		}
        		// Walk Right
                if (this.cursors.right.isDown) {
                	Bionic.Player.facing = 'right';
                	Bionic.Player.sprite.body.velocity.x = Bionic.Player.moveSpeed;
                	Bionic.Player.updateState(this.STATE.WALK);
            	}
            	// Crouch
            	if (this.cursors.down.isDown) {
            		Bionic.Player.updateState(this.STATE.CROUCH);
            	}
                break;
            case this.STATE.WALK:
            	// Switch Left
                if (this.cursors.left.isDown) {
            		Bionic.Player.facing = 'left';
            		Bionic.Player.sprite.body.velocity.x = -Bionic.Player.moveSpeed;
        		}
        		// Switch Right
                if (this.cursors.right.isDown) {
                	Bionic.Player.facing = 'right';
                	Bionic.Player.sprite.body.velocity.x = Bionic.Player.moveSpeed;
            	}
            	// Stop Walking
            	if (this.cursors.left.isUp && this.cursors.right.isUp){
            		Bionic.Player.sprite.body.velocity.x = 0;
            		Bionic.Player.updateState(this.STATE.IDLE);
            	}
            	// Crouch
            	if (this.cursors.down.isDown) {
            		Bionic.Player.updateState(this.STATE.CROUCH);
            		Bionic.Player.sprite.body.velocity.x = 0;
            	}
                break;
            case this.STATE.CROUCH:
            	// Switch Left
                if (this.cursors.left.isDown) {
            		Bionic.Player.facing = 'left';
        		}
        		// Switch Right
                if (this.cursors.right.isDown) {
                	Bionic.Player.facing = 'right';
            	}
            	// Stand
            	if (this.cursors.down.isUp) {
            		Bionic.Player.updateState(this.STATE.IDLE);
            	}
                break;
            case this.STATE.C_CROUCH:
            	break;
            case this.STATE.C_DIAG:
            	break;
            case this.STATE.C_UP:
            	break;
            case this.SWING:
            	break;
        }
        
        /*if (this.cursors.down.isDown){
            if (this.c_shoot.isDown){
                Bionic.Player.updateState(this.STATE.C_CROUCH);
            }
            else {
                Bionic.Player.updateState(this.STATE.CROUCH);
                if (this.cursors.left.isDown){
                    Bionic.Player.facing = 'left';
                }
                else if (this.cursors.right.isDown){
                    Bionic.Player.facing = 'right';
                }
            }
            
        }
        else {
            if (this.cursors.left.isDown){
                Bionic.Player.facing = 'left';
                Bionic.Player.updateState(this.STATE.WALK);
            }
            else if (this.cursors.right.isDown){
                Bionic.Player.facing = 'right';
                Bionic.Player.updateState(this.STATE.WALK);
            }
            else Bionic.Player.updateState(this.STATE.IDLE);
        }*/
        
    }
};

Bionic.Player = {
    // Player Properties
    sprite: undefined,
    facing: 'right',
    scale: 2,
    currState: undefined,
    moveSpeed: undefined,
    currHealth: undefined,
    maxHealth: undefined,
    claw: undefined,
    
    animationList: {
        idle: undefined,
        walk: undefined,
        crouch: undefined,
        c_crouch: undefined,
        c_diag: undefined,
        c_up: undefined,
        swing: undefined,
        hurt: undefined,
        dead: undefined,
    },

    spawnPlayer: function(game, x, y, sprite, clawSprite){
        // Health / Damage
        this.maxHealth = this.currHealth = 4;
        // Game Sprite
        this.sprite = game.add.sprite(x, y, sprite);
        this.animationList.idle = this.sprite.animations.add('idle', [0]);
        this.animationList.walk = this.sprite.animations.add('walk', [1, 2, 3]);
        this.animationList.crouch = this.sprite.animations.add('crouch', [4]);
        this.animationList.c_crouch = this.sprite.animations.add('c_crouch', [5, 6]);
        this.animationList.c_diag = this.sprite.animations.add('c_diag', [7, 8]);
        this.animationList.c_up = this.sprite.animations.add('c_up', [9, 10]);
        this.animationList.swing = this.sprite.animations.add('swing', [11, 12]);
        this.animationList.hurt = this.sprite.animations.add('hurt', [13]);
        this.sprite.anchor.setTo(0.5, 0.5);
        // Physics
        game.physics.enable(this.sprite, game.physics.ARCADE);
        this.sprite.body.collideWorldBounds = true;
        this.moveSpeed = 200;
        // Claw Initialization
        this.claw = game.add.sprite(-200, -200, clawSprite);
        this.claw.prototype = {
            animation: this.sprite.animations.add('animation', [0, 1, 2, 1, 0]),
            firing: false,
            hooked: false,
        };
    },
        
    updateState: function(animationState){
        this.currState = animationState;
    }
};

// ==============================================================
//
//						Old code - Reference
//
// ==============================================================
//

    /*fireClaw: function() {
        this.player.claw.firing = true;
        switch (this.player.currState)
        {
            case this.STATE.C_CROUCH:
                this.player.animations.play('c_crouch', 8, false);
                this.player.c_crouch.onComplete.add(function(){
                    this.player.claw.angle = 0;
                    this.player.claw.y = this.player.body.y + 70;
                    switch (this.player.facing){
                        case 'right':
                            this.player.claw.x = this.player.body.x + 150;
                            break;
                        case 'left':
                            this.plaer.claw.x = this.player.body.x - 58;
                            this.player.claw.angle = 180;
                    }
                });
                break;
            case this.STATE.C_DIAG:
            this.player.animations.play('c_diag', 8, false);
            this.player.c_diag.onComplete.add(function(){
                switch (this.player.facing){
                    case 'right':
                        this.player.claw.x = this.player.body.x + 124;
                        this.player.claw.y = this.player.body.y - 34;
                        this.player.claw.angle = -45;
                        break;
                    case 'left':
                        this.plaer.claw.x = this.player.body.x - 22;
                        this.player.claw.y = this.player.body.y - 32;
                        this.player.claw.angle = 0;
                }
            });
                break;
            case this.STATE.C_UP:
                this.player.animations.play('c_up', 8, false);
                this.player.c_diag.onComplete.add(function(){
                this.player.claw.angle = -90;
                this.player.claw.y = this.player.body.y - 60;
                switch (this.player.facing){
                    case 'right':
                        this.player.claw.x = this.player.body.x + 42;
                        break;
                    case 'left':
                        this.plaer.claw.x = this.player.body.x - 52;
                }
            });
        }
        this.player.claw.animations.play('extend', 6, false);
        this.player.claw.extend.onComplete.add(function(){
            this.player.claw.x = -200;
            this.player.claw.y = -200;
            this.player.claw.firing = false;
        }); 
    }*/


    /*    this.player.claw = this.add.sprite(-200, -200, 'clawSheet');
        this.player.claw.prototype = {
            firing: false,
            hooked: false,
            extend: undefined,
            currState: undefined
        };
        this.player.bullets = this.add.group();
        this.player.bullets.enableBody = true;
        this.player.bullets.physicsBodyType = this.physics.ARCADE;
        this.player.bullets.createMultiple(30, 'bullet');
        this.player.bullets.setAll('anchor.x', 0.5);
        this.player.bullets.setAll('anchor.y', 1);
        this.player.bullets.setAll('outOfBoundsKill', true);
        this.player.bullets.setAll('checkWorldBounds', true);
        this.player.bullets.setAll('body.allowGravity', false);

        this.player.scale.x = this.player.scale.y = 2;
        // Player animations
        this.player.anchor.setTo(0.5, 0.5);
        this.player.idle = this.player.animations.add('idle', [0]);
        this.player.walk = this.player.animations.add('walk', [1, 2, 3]);
        this.player.crouch = this.player.animations.add('crouch', [4]);
        this.player.c_crouch = this.player.animations.add('c_crouch', [5, 6]);
        this.player.c_diag = this.player.animations.add('c_diag', [7, 8]);
        this.player.c_up = this.player.animations.add('c_up', [9, 10]);
        this.player.swing = this.player.animations.add('swing', [11, 12]);
        this.player.hurt = this.player.animations.add('hurt', [13]);
        // Player's Claw
        this.physics.arcade.enable(this.player.claw);
        this.player.claw.body.allowGravity = false;
        this.player.claw.extend = this.player.claw.animations.add(0, [0, 1, 2, 1, 0]);
        this.player.claw.anchor.setTo(0.5, 0.5);
        this.player.claw.currState = this.C_STATE.NONE;
        this.player.claw.scale.x = this.player.claw.y = 3;
    */
   
   
           // Enemy
        /*enemy.prototype = {
            // Animation
            idle: undefined,
            walk: undefined,
            crouch: undefined,
            hurt: undefined,
            STATE: {
                IDLE: 0,
                WALK: 1,
                CROUCH: 2,
                HURT: 3
            },
            facing: 'right',
            bullets: undefined,
            spawn: function(){
                
            }
        };
        this.enemy.bullets = this.add.group();
        this.enemy.bullets.enableBody = true;
        this.enemy.bullets.physicsBodyType = Phaser.Physics.Arcade;
        this.enemy.bullets.createMultiple(30, 'bullet');
        this.enemy.bullets.setAll('anchor.x', 0.5);
        this.enemy.bullets.setAll('anchor.y', 1);
        this.enemy.bullets.setAll('outOfBoundsKill', true);
        this.enemy.bullets.setAll('checkWorldBounds', true);
        this.enemy.bullets.setAll('body.allowGravity', false);
        */
