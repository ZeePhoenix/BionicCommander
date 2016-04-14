Bionic.Player = {
	// Player Properties
	health: 100,
	sprite: undefined,
	facing: 'right',
	scale: 0.25,
	currState: undefined,
	damageTime: undefined,
  // Movement
	maxSpeed: 500,
  acceleration: 1500,
  drag: 1200,
  gravity: 2600,
  jumpSpeed: -800,
	canJump: true,
	// Gun
	bullets: undefined,
	fireRate: 16,
	nextFire: 0,
  bulletDamage: 10,
	melee: false,

	STATE: {
		IDLE: 0,
		RUN: 1,
		RUN_FIRE: 2,
		CROUCH: 3,
		CROUCH_FIRE: 4,
    RISE: 5,
		JUMP: 6,
		JUMP_FIRE: 7,
		HURT: 8,
		FIRE: 9,
		MELEE: 10,
	},

	spawnPlayer: function(game, x, y, sprite) {
		// Game Sprite
		this.sprite = game.add.sprite(x, y, sprite);
		this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames('Idle/', 0, 9, '.png', 2), 10, true, false);
		this.sprite.animations.add('run', Phaser.Animation.generateFrameNames('Run/', 0, 9, '.png', 2), 15, true, false);
		this.sprite.animations.add('crouch', Phaser.Animation.generateFrameNames('Crouch/', 0, 9, '.png', 2), 10, true, false);
    this.sprite.animations.add('rise', Phaser.Animation.generateFrameNames('Jump/', 0, 2, '.png', 2), 5, false, false);
		this.sprite.animations.add('jump', Phaser.Animation.generateFrameNames('Jump/', 3, 9, '.png', 2), 5, false, false);
		this.sprite.animations.add('jump_fire', Phaser.Animation.generateFrameNames('Jump/Shoot/', 0, 9, '.png', 2), 5, false, false);
		this.sprite.animations.add('fire', Phaser.Animation.generateFrameNames('Idle/Shoot/', 0, 9, '.png', 2), 10, false, false);
		this.sprite.animations.add('crouch_fire', Phaser.Animation.generateFrameNames('Crouch/Shoot/', 0, 3, '.png', 2), 10, false, false);
		this.sprite.animations.add('melee', Phaser.Animation.generateFrameNames('Idle/Melee/', 0, 9, '.png', 2), 15, false, false);
		this.sprite.anchor.setTo(0, 1);
		// Physics
		game.physics.enable(this.sprite, game.physics.ARCADE);
    this.sprite.body.maxVelocity.setTo(this.maxSpeed, this.maxSpeed * 10);
    this.sprite.body.drag.setTo(this.drag, 0);
    this.sprite.body.linearDamping = 1;
		game.physics.arcade.gravity.y = this.gravity;
		// Bullets
		this.bullets = game.add.group();
		this.bullets.createMultiple(50, 'bullet');
    game.physics.enable(this.bullets, game.physics.ARCADE);
		this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('tint', 0xff00ff);
		this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('scale.x', 2.5);
    this.bullets.setAll('scale.y', 2.5);
		this.bullets.setAll('body.allowGravity', false);
		
		this.damageTime = 0;
	},

	Draw: function() {
		// Switch Direction facing
		switch (this.facing) {
			case 'right':
				this.sprite.scale.x = this.scale;
				this.sprite.scale.y = this.scale;
        this.sprite.anchor.setTo(0, 1);
				this.sprite.body.setSize(250, 480, 18, -20);
				break;
			case 'left':
				this.sprite.scale.x = -this.scale;
				this.sprite.scale.y = this.scale;
        this.sprite.anchor.setTo(0.5, 1);
				this.sprite.body.setSize(250, 480, 28, -20);
				break;
		}
		
		// Update Animation according to State
		switch (this.currState) {
			case this.STATE.IDLE:
				this.sprite.animations.play('idle');
				break;
			case this.STATE.RUN:
				this.sprite.animations.play('run', 15, true);
				break;
			case this.STATE.CROUCH:
				this.sprite.body.setSize(250, 350);
        this.sprite.anchor.y = 1.1;
				this.sprite.animations.play('crouch');
				break;
			case this.STATE.CROUCH_FIRE:
				this.sprite.body.setSize(250, 350);
        this.sprite.anchor.y = 1.1;
				this.sprite.animations.play('crouch_fire');
				this.fire(this.game, Bionic.time);
				break;
      case this.STATE.RISE:
        if (this.sprite.body.velocity.y > 0 )
          this.currState = this.STATE.JUMP;
        else
          this.sprite.animations.play('rise');
        break;
			case this.STATE.JUMP:
				if (this.sprite.body.blocked.down || this.sprite.body.touching.down)
					this.updateState(this.STATE.IDLE);
				else this.sprite.animations.play('jump');
				break;
			case this.STATE.FIRE:
				this.sprite.animations.play('fire');
				this.fire(this.game, Bionic.time);
				break;
			case this.STATE.MELEE:
				this.sprite.animations.play('melee');
				this.melee = true;
				if(this.facing == 'left')
					this.sprite.body.setSize(250, 480, 5, -20);
				else
					this.sprite.body.setSize(250, 480, 18, -20);
				this.sprite.animations.getAnimation('melee').onComplete.add(function(){ 
					Bionic.Player.updateState(Bionic.Player.STATE.IDLE); 
					Bionic.Player.melee = false;
				});
				break;
		}

	},

	updateState: function(animationState) {
		this.currState = animationState;
	},

	update: function(game, cursors, z, x, enemies, time) {

		// Check for movement depending on state
		switch (this.currState) {
			case this.STATE.IDLE:
				// Stop Walking
				if (!cursors.left.isDown || !cursors.right.isDown) {
					this.sprite.body.velocity.x = 0;
          this.sprite.body.acceleration.x = 0;
				}
				// Walk Left
				if (cursors.left.isDown) {
					this.facing = 'left';
					this.sprite.body.acceleration.x -= this.acceleration;
					this.updateState(this.STATE.RUN);
				}
				// Walk Right
				if (cursors.right.isDown) {
					this.facing = 'right';
					this.sprite.body.acceleration.x += this.acceleration;
					this.updateState(this.STATE.RUN);
				}
				// Crouch
				if (cursors.down.isDown) {
					this.updateState(this.STATE.CROUCH);
				}
				// Jump
				if (cursors.up.isDown && (this.sprite.body.onFloor() || this.sprite.body.touching.down || this.sprite.body.blocked.down)) {
					this.sprite.body.velocity.y = this.jumpSpeed;
					this.updateState(this.STATE.RISE);
				}
				// Shoot
				if (z.isDown) {
					this.updateState(this.STATE.FIRE);
				}
				// Melee
				if (x.isDown) {
					this.updateState(this.STATE.MELEE);
				}
				break;
			case this.STATE.RUN:
				// Switch Left
				if (cursors.left.isDown) {
					this.facing = 'left';
          this.sprite.body.acceleration.x = 0;
          this.sprite.body.acceleration.x -= this.acceleration;
				}
				// Switch Right
				if (cursors.right.isDown) {
					this.facing = 'right';
          this.sprite.body.acceleration.x = 0;
					this.sprite.body.acceleration.x += this.acceleration;
				}
				// Stop Running
				if (cursors.left.isUp && cursors.right.isUp) {
          this.sprite.body.acceleration.x = 0;
					this.updateState(this.STATE.IDLE);
				}
				// Jump
				if (cursors.up.isDown && (this.sprite.body.onFloor() || this.sprite.body.touching.down || this.sprite.body.blocked.down)) {
					this.sprite.body.velocity.y = this.jumpSpeed;
					this.updateState(this.STATE.RISE);
				}
				// Crouch
				if (cursors.down.isDown) {
					this.sprite.body.velocity.x = 0;
					this.updateState(this.STATE.CROUCH);
				}
				break;
			case this.STATE.CROUCH:
				// Stand up
				if (cursors.down.isUp) {
					this.updateState(this.STATE.IDLE);
				}
				// Switch Left
				if (cursors.left.isDown) {
					this.facing = 'left';
				}
				// Switch Right
				if (cursors.right.isDown) {
					this.facing = 'right';
				}
				// Shoot
				if (z.isDown) {
					this.updateState(this.STATE.CROUCH_FIRE);
				}
				break;
			case this.STATE.FIRE:
				// Cease Fire
				if (z.isUp) {
					this.updateState(this.STATE.IDLE);
        }
        // Crouch
        if (cursors.down.isDown) {
          this.updateState(this.STATE.CROUCH_FIRE);
        }
				// Switch Left
				if (cursors.left.isDown) {
					this.facing = 'left';
					this.sprite.body.velocity.x = -this.moveSpeed;
					this.updateState(this.STATE.RUN);
				}
				// Switch Right
				if (cursors.right.isDown) {
					this.facing = 'right';
					this.sprite.body.velocity.x = this.moveSpeed;
					this.updateState(this.STATE.RUN);
				}
				break;
			case this.STATE.CROUCH_FIRE:
				// Cease Fire
				if (z.isUp)
					this.updateState(this.STATE.CROUCH);
        if (cursors.down.isUp) {
          this.updateState(this.STATE.FIRE);
        }
				// Switch Left
				if (cursors.left.isDown) {
					this.facing = 'left';
				}
				// Switch Right
				if (cursors.right.isDown) {
					this.facing = 'right';
				}
				break;
		}
    
    // Check bullets
    this.bullets.forEach(function(bullet){
      if (bullet.body.velocity.x === 0 && bullet.body.velocity.y === 0)
        bullet.kill();
    });
	},

	fire: function(game, time) {
		if (time > this.nextFire && this.bullets.countDead() > 0) {
			Bionic.sfx.play();
			this.nextFire = time + this.fireRate;
			var bullet = this.bullets.getFirstDead();
			switch (this.facing) {
				case 'left':
          if (this.currState == this.STATE.CROUCH_FIRE) bullet.reset(this.sprite.x - 35, this.sprite.y - 75);
            else bullet.reset(this.sprite.x - 35, this.sprite.y - 95);
					bullet.body.velocity.x = -500;
					break;
				case 'right':
          if (this.currState == this.STATE.CROUCH_FIRE) bullet.reset(this.sprite.x + 105, this.sprite.y - 75);
            else bullet.reset(this.sprite.x + 105, this.sprite.y - 95);
					bullet.body.velocity.x = 500;
					break;
			}
		}
	},
	
	takeDamage: function(amount) {
		this.health -= amount;
	}
};