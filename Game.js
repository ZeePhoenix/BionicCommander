// MAIN GAME STATE
var Bionic = Bionic || {};

Bionic.MainGame = function() {
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
    create: function() {
        // Set up game world
        this.physics.startSystem(this.physics.Arcade);
        this.physics.gravity = true;
        this.physics.arcade.gravity.y = 250;
        
        // Set up map
        this.background = this.add.sprite(-1500, -500, 'background');
        
        // Set up Player
        this.player = this.add.sprite(25, 350, 'radSpencer');
        this.player.prototype = {
            // Animation
            idle: undefined,
            walk: undefined,
            crouch: undefined,
            c_crouch: undefined,
            c_diag: undefined,
            c_up: undefined,
            swing: undefined,
            hurt: undefined,
            dead: undefined,
            currState: undefined,
            moveSpeed: undefined,
            // Claw
            claw: undefined,
            facing: 'right',
            bullets: undefined,
            
            updateAnimation: function(){
                switch(this.currState){
                    case this.STATE.IDLE:
                        this.player.animations.play('idle');
                        break;
                    case this.STATE.WALK:
                        this.player.animations.play('walk', 5, true);
                        break;
                }
            }
        };
        this.player.claw = this.add.sprite(-200, -200, 'clawSheet');
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
        this.game.physics.enable(this.player, this.physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.currState = this.STATE.IDLE;
        this.player.moveSpeed = 200;
        Bionic.health = 1;
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
        
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.shoot = this.input.keyboard.addKey(this.input.keyboard.x);
        this.c_shoot = this.input.keyboard.addKey(this.input.keyboard.z);
    },
    update: function() {
        this.checkControls();
        
        if (this.player.body.velocity.y > 200) this.player.currState = this.STATE.PARACHUTE;
        
        switch (this.player.currState)
        {
            case this.STATE.IDLE:
                this.player.animations.play('idle');
                this.player.body.velocity.x = 0;
                break;
            case this.STATE.WALK:
                this.player.animations.play('walk', 10, true);
                switch (this.player.facing){
                    case 'right':
                        this.player.body.velocity.x = this.player.moveSpeed;
                        break;
                    case 'left':
                        this.player.body.velocity.x = -this.player.moveSpeed;
                }
                break;
            case this.STATE.CROUCH:
                this.player.animations.play('crouch', 10, true);
                this.player.body.velocity.x = 0;
                break;
            case this.STATE.C_CROUCH:
            case this.STATE.C_DIAG:
            case this.STATE.C_UP:
                if (!this.player.claw.firing) this.fireClaw();
                break;
                
        }
        
        switch (this.player.facing)
        {
            case 'right':
                this.player.scale.x = 2;
                this.player.scale.y = 2;
                break;
            case 'left':
                this.player.scale.x = -2;
                this.player.scale.y = 2;
                break;
        }
    },
    
    checkControls: function() {
        // Check for movement
        if (this.cursors.down.isDown){
            this.player.currState = this.STATE.CROUCH;
            if (this.cursors.left.isDown){
                this.player.facing = 'left';
            }
            else if (this.cursors.right.isDown){
                this.player.facing = 'right';
            }
        }
        else {
            if (this.cursors.left.isDown){
                this.player.facing = 'left';
                this.player.currState = this.STATE.WALK;
            }
            else if (this.cursors.right.isDown){
                this.player.facing = 'right';
                this.player.currState = this.STATE.WALK;
            }
            else this.player.currState = this.STATE.IDLE;
        }
        
    },
    
    fireClaw: function() {
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
    }
};