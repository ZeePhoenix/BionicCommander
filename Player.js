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
		RUN_FIRE: 2,
		CROUCH: 3,
		CROUCH_FIRE: 4,
		JUMP: 5,
		JUMP_FIRE: 6,
		HURT: 7,
		FIRE: 8,
	},

	spawnPlayer: function(game, x, y, sprite) {
		// Game Sprite
		this.sprite = game.add.sprite(x, y, sprite);
		this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames('Idle/', 0, 9, '.png', 2), 10, true, false);
		this.sprite.animations.add('run', Phaser.Animation.generateFrameNames('Run/', 0, 9, '.png', 2), 15, true, false);
		this.sprite.animations.add('crouch', Phaser.Animation.generateFrameNames('Crouch/', 0, 9, '.png', 2), 10, true, false);
		this.sprite.animations.add('jump', Phaser.Animation.generateFrameNames('Jump/', 0, 9, '.png', 2), 5, false, false);
		this.sprite.animations.add('jump_fire', Phaser.Animation.generateFrameNames('Jump/Shoot/', 0, 9, '.png', 2), 5, false, false);
		this.sprite.animations.add('fire', Phaser.Animation.generateFrameNames('Idle/Shoot/', 0, 9, '.png', 2), 10, false, false);
		this.sprite.animations.add('crouch_fire', Phaser.Animation.generateFrameNames('Crouch/Shoot/', 0, 3, '.png', 2), 10, false, false);
		this.sprite.anchor.setTo(0, 1);
		// Physics
		game.physics.enable(this.sprite, game.physics.ARCADE);
		this.sprite.body.friction = 0;
		this.sprite.body.mass = 100;
		this.sprite.body.collideWorldBounds = true;
		//this.sprite.body.bounce.x = this.sprite.body.bounce.y = 0.1;
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
        this.sprite.anchor.setTo(0, 1);
				this.sprite.body.setSize(250, 480, 18, -20);
				break;
			case 'left':
				this.sprite.scale.x = -this.scale;
				this.sprite.scale.y = this.scale;
        this.sprite.anchor.setTo(0.5, 1);
				this.sprite.body.setSize(250, 480, 32, -20);
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
				this.sprite.animations.play('crouch');
				break;
			case this.STATE.CROUCH_FIRE:
				this.sprite.body.setSize(250, 350);
				this.sprite.animations.play('crouch_fire');
				this.fire(this.game, Bionic.time);
				break;
			case this.STATE.JUMP:
				if (Math.abs(this.sprite.body.velocity.y) < 0.25 && (this.sprite.body.blocked.down || this.sprite.body.touching.down)) {
					this.sprite.body.velocity.y = 0;
					this.updateState(this.STATE.IDLE)
				} else this.sprite.animations.play('jump');
				break;
			case this.STATE.FIRE:
				this.sprite.animations.play('fire');
				this.fire(this.game, Bionic.time);
		}

	},

	updateState: function(animationState) {
		this.currState = animationState;
	},

	checkControls: function(game, cursors, w, a, s, d, k) {

		// Check for movement depending on state
		switch (this.currState) {
			case this.STATE.IDLE:
				// Stop Walking
				if (cursors.left.isUp && cursors.right.isUp) {
					this.sprite.body.velocity.x = 0;
				}
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
				// Crouch
				if (cursors.down.isDown || s.isDown) {
					this.updateState(this.STATE.CROUCH);
				}
				// Jump
				if ((w.isDown || cursors.up.isDown) && (this.sprite.body.onFloor() || this.sprite.body.touching.down || this.sprite.body.blocked.down)) {
					this.sprite.body.velocity.y = -250;
					this.updateState(this.STATE.JUMP);
				}
				// Shoot
				if (k.isDown) {
					this.updateState(this.STATE.FIRE);
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
				// Jump
				if ((w.isDown || cursors.up.isDown) && (this.sprite.body.onFloor() || this.sprite.body.touching.down || this.sprite.body.blocked.down)) {
					this.sprite.body.velocity.y = -250;
					this.updateState(this.STATE.JUMP);
				}
				// Crouch
				if (cursors.down.isDown || s.isDown) {
					this.sprite.body.velocity.x = 0;
					this.updateState(this.STATE.CROUCH);
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
				// Shoot
				if (k.isDown) {
					this.updateState(this.STATE.CROUCH_FIRE);
				}
				break;
			case this.STATE.FIRE:
				// Cease Fire
				if (k.isUp)
					this.updateState(this.STATE.IDLE);
				// Switch Left
				if (cursors.left.isDown || a.isDown) {
					this.facing = 'left';
					this.sprite.body.velocity.x = -this.moveSpeed;
					this.updateState(this.STATE.RUN);
				}
				// Switch Right
				if (cursors.right.isDown || d.isDown) {
					this.facing = 'right';
					this.sprite.body.velocity.x = this.moveSpeed;
					this.updateState(this.STATE.RUN);
				}
				break;
			case this.STATE.CROUCH_FIRE:
				// Cease Fire
				if (k.isUp)
					this.updateState(this.STATE.CROUCH);
        if (cursors.down.isUp) {
          this.updateState(this.STATE.FIRE);
        }
				// Switch Left
				if (cursors.left.isDown || a.isDown) {
					this.facing = 'left';
				}
				// Switch Right
				if (cursors.right.isDown || d.isDown) {
					this.facing = 'right';
				}
				break;
		}

	},

	fire: function(game, time) {
		if (time > this.nextFire && this.bullets.countDead() > 0) {
			this.nextFire = time + this.fireRate;
			var bullet = this.bullets.getFirstDead();
			switch (this.facing) {
				case 'left':
          if (this.currState == this.STATE.CROUCH_FIRE) bullet.reset(this.sprite.x - 35, this.sprite.y - 60);
            else bullet.reset(this.sprite.x - 35, this.sprite.y - 90);
					bullet.body.velocity.x = -500;
					break;
				case 'right':
          if (this.currState == this.STATE.CROUCH_FIRE) bullet.reset(this.sprite.x + 105, this.sprite.y - 60);
            else bullet.reset(this.sprite.x + 105, this.sprite.y - 90);
					bullet.body.velocity.x = 500;
					break;
			}
		}
	}
};