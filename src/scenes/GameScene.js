(function (global) {
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: "GameScene" });
      this.roundState = RoundState.NuevaRonda;
      this.roundNumber = 1;
      this.playerWon = false;
      this.facingRight = true;
      this.isAttacking = false;
      this.comboStep = 0;
      this.comboWindow = 500;
      this.comboInputWindowOpen = false;
      this.comboNextRequested = false;
      this.comboResetTimer = null;
      this.attackHitbox = null;
      this.playerMechanics = null;
    }

    init(data) {
      this.roundNumber = (data && data.roundNumber) || 1;
    }

    preload() {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xEDC9AF, 1);
      graphics.fillRect(0, 0, 64, 20);
      graphics.generateTexture("platformTexture", 64, 20);
      graphics.clear();

      graphics.fillStyle(0xe74c3c, 1);
      graphics.fillRect(0, 0, 28, 28);
      graphics.generateTexture("enemyTexture", 28, 28);
      graphics.clear();

      graphics.fillStyle(0xffffff, 0.35);
      graphics.fillRect(0, 0, 40, 20);
      graphics.generateTexture("attackTexture", 40, 20);
      graphics.destroy();

      this.load.spritesheet("heroIdle", "/assets/IDLE.png", { frameWidth: 96, frameHeight: 84 });
      this.load.spritesheet("heroRun", "/assets/RUN.png", { frameWidth: 96, frameHeight: 84 });
      this.load.spritesheet("heroJump", "/assets/JUMP.png", { frameWidth: 96, frameHeight: 84 });
      this.load.spritesheet("heroAttack1", "/assets/ATTACK 1.png", { frameWidth: 96, frameHeight: 84 });
      this.load.spritesheet("heroAttack2", "/assets/ATTACK 2.png", { frameWidth: 96, frameHeight: 84 });
      this.load.spritesheet("heroAttack3", "/assets/ATTACK 3.png", { frameWidth: 96, frameHeight: 84 });
      this.load.spritesheet("heroAttack3RUN", "/assets/ATTACK 3 RUN.png", { frameWidth: 96, frameHeight: 84 });
      this.load.spritesheet("heroDeath", "/assets/DEATH.png", { frameWidth: 96, frameHeight: 84 });
      this.load.spritesheet("heroHurt", "/assets/HURT.png", { frameWidth: 96, frameHeight: 84 });
      this.load.image("bg", "/assets/bg.png");
    }

    create() {
      this.roundState = RoundState.NuevaRonda;
      this.playerWon = false;
      this.isAttacking = false;
      this.comboStep = 0;
      this.comboInputWindowOpen = false;
      this.comboNextRequested = false;

      if (this.comboResetTimer) {
        this.comboResetTimer.remove(false);
        this.comboResetTimer = null;
      }

      this.physics.world.setBounds(0, 0, 1400, 500);
      this.cameras.main.setBounds(0, 0, 1400, 500);

      const background = this.add.image(700, 250, "bg");
      background.setDisplaySize(1400, 500);
      background.setDepth(-1);

      this.ensureAnimations();

      this.platforms = this.physics.add.staticGroup();
      this.enemies = this.physics.add.group();

      this.createPlatform(250, 490, 500, 20);
      this.createPlatform(750, 490, 500, 20);
      this.createPlatform(1150, 490, 500, 20);
      this.createPlatform(250, 390, 120, 20);
      this.createPlatform(430, 320, 120, 20);
      this.createPlatform(650, 260, 120, 20);
      this.createPlatform(880, 330, 120, 20);
      this.createPlatform(1100, 250, 120, 20);

      this.player = this.physics.add.sprite(80, 420, "heroIdle", 0);
      this.player.setCollideWorldBounds(true);
      this.player.body.setSize(28, 44);
      this.player.body.setOffset(18, 18);
      this.player.play("hero_idle");

      this.playerMechanics = new PlayerMechanics(this, this.player, 3);
      this.playerMechanics.attachUI(16, 76);

      this.attackHitbox = this.physics.add.sprite(this.player.x, this.player.y, "attackTexture");
      this.attackHitbox.setVisible(false);
      this.attackHitbox.body.allowGravity = false;
      this.attackHitbox.body.setEnable(false);

      this.createEnemy(500, 280);
      this.createEnemy(900, 290);
      this.createEnemy(1180, 210);

      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.enemies, this.platforms);
      this.physics.add.collider(this.player, this.enemies, this.hitPlayer, null, this);
      this.physics.add.overlap(this.attackHitbox, this.enemies, this.attackEnemy, null, this);

      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

      this.keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.SPACE,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      });

      this.input.on("pointerdown", function (pointer) {
        if (pointer.leftButtonDown()) {
          this.playerAttack();
        }
      }, this);

      this.statusText = this.add.text(16, 16, "Estado: " + this.roundState, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setScrollFactor(0).setDepth(100);

      this.infoText = this.add.text(16, 46, "Ronda " + this.roundNumber + " - Elimina todos los enemigos", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setScrollFactor(0).setDepth(100);

      this.time.delayedCall(900, () => {
        this.setRoundState(RoundState.RondaEnProgreso);
      });
    }

    setRoundState(nextState) {
      this.roundState = nextState;
      this.statusText.setText("Estado: " + nextState);
    }

    ensureAnimations() {
      if (!this.anims.exists("hero_idle")) {
        this.anims.create({ key: "hero_idle", frames: this.anims.generateFrameNumbers("heroIdle", { start: 0, end: 6 }), frameRate: 8, repeat: -1 });
      }
      if (!this.anims.exists("hero_run")) {
        this.anims.create({ key: "hero_run", frames: this.anims.generateFrameNumbers("heroRun", { start: 0, end: 7 }), frameRate: 12, repeat: -1 });
      }
      if (!this.anims.exists("hero_attack1")) {
        this.anims.create({ key: "hero_attack1", frames: this.anims.generateFrameNumbers("heroAttack1", { start: 0, end: 5 }), frameRate: 32, repeat: 0 });
      }
      if (!this.anims.exists("hero_attack2")) {
        this.anims.create({ key: "hero_attack2", frames: this.anims.generateFrameNumbers("heroAttack2", { start: 0, end: 4 }), frameRate: 12, repeat: 0 });
      }
      if (!this.anims.exists("hero_attack3")) {
        this.anims.create({ key: "hero_attack3", frames: this.anims.generateFrameNumbers("heroAttack3", { start: 0, end: 5 }), frameRate: 10, repeat: 0 });
      }
      if (!this.anims.exists("hero_attack3_run")) {
        this.anims.create({ key: "hero_attack3_run", frames: this.anims.generateFrameNumbers("heroAttack3RUN", { start: 0, end: 5 }), frameRate: 10, repeat: 0 });
      }
      if (!this.anims.exists("hero_hurt")) {
        this.anims.create({ key: "hero_hurt", frames: this.anims.generateFrameNumbers("heroHurt", { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
      }
      if (!this.anims.exists("hero_death")) {
        this.anims.create({ key: "hero_death", frames: this.anims.generateFrameNumbers("heroDeath", { start: 0, end: 11 }), frameRate: 10, repeat: 0 });
      }
    }

    createPlatform(x, y, width, height) {
      const platform = this.platforms.create(x, y, "platformTexture");
      platform.displayWidth = width;
      platform.displayHeight = height;
      platform.refreshBody();
      return platform;
    }

    createEnemy(x, y) {
      const enemy = this.enemies.create(x, y, "enemyTexture");
      enemy.setCollideWorldBounds(true);
      enemy.setVelocityX(-60);
      return enemy;
    }

    update() {
      if (!this.player || !this.player.active || this.playerMechanics.isDead || this.roundState !== RoundState.RondaEnProgreso) {
        return;
      }

      const moveSpeed = 180;
      const jumpForce = -500;
      this.player.setVelocityX(0);

      if (this.keys.left.isDown) {
        this.player.setVelocityX(-moveSpeed);
        this.facingRight = false;
        this.player.flipX = true;
      } else if (this.keys.right.isDown) {
        this.player.setVelocityX(moveSpeed);
        this.facingRight = true;
        this.player.flipX = false;
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.up) && this.player.body.blocked.down) {
        this.player.setVelocityY(jumpForce);
      }

      if (!this.isAttacking) {
        if (!this.player.body.blocked.down) {
          this.updateJumpFrame();
        } else if (this.keys.left.isDown || this.keys.right.isDown) {
          this.player.play("hero_run", true);
        } else {
          this.player.play("hero_idle", true);
        }
      }

      this.attackHitbox.x = this.facingRight ? this.player.x + 26 : this.player.x - 26;
      this.attackHitbox.y = this.player.y;

      this.enemies.children.iterate(function (enemy) {
        if (!enemy || !enemy.active) {
          return;
        }
        if (enemy.body.blocked.left) {
          enemy.setVelocityX(60);
        } else if (enemy.body.blocked.right) {
          enemy.setVelocityX(-60);
        }
      });

      if (!this.isAttacking && this.comboInputWindowOpen && this.comboNextRequested) {
        this.comboInputWindowOpen = false;
        this.comboNextRequested = false;

        if (this.comboStep === 1) {
          this.startComboAttack(2);
        } else if (this.comboStep === 2) {
          this.startComboAttack(3);
        }
      }

      if (this.player.y > 560) {
        this.playerDie();
      }

      if (this.enemies.countActive(true) === 0 && !this.playerWon) {
        this.playerWon = true;
        this.setRoundState(RoundState.RondaFinalizada);
        this.time.delayedCall(500, () => {
          this.scene.start("EndGameScene", { result: "win", roundNumber: this.roundNumber });
        });
      }
    }

    updateJumpFrame() {
      this.player.setTexture("heroJump");

      if (this.player.body.velocity.y < -40) {
        this.player.setFrame(this.player.body.velocity.y < -220 ? 0 : 1);
      } else if (this.player.body.velocity.y <= 40) {
        this.player.setFrame(2);
      } else {
        this.player.setFrame(this.player.body.velocity.y < 220 ? 3 : 4);
      }
    }

    playerAttack() {
      if (!this.player.active || this.playerMechanics.isDead || this.roundState !== RoundState.RondaEnProgreso) {
        return;
      }
      if (this.isAttacking) {
        return;
      }
      if (this.comboInputWindowOpen) {
        this.comboNextRequested = true;
        return;
      }
      if (this.comboStep === 0) {
        this.startComboAttack(1);
      }
    }

    startComboAttack(attackNumber) {
      this.isAttacking = true;
      this.comboInputWindowOpen = false;
      this.comboNextRequested = false;

      if (this.comboResetTimer) {
        this.comboResetTimer.remove(false);
        this.comboResetTimer = null;
      }

      this.comboStep = attackNumber;
      this.player.setVelocityX(0);

      let currentAnimation = "hero_attack1";
      let activeTime = 120;

      if (this.comboStep === 2) {
        currentAnimation = "hero_attack2";
      }
      if (this.comboStep === 3) {
        const isMoving = this.keys.left.isDown || this.keys.right.isDown;
        currentAnimation = isMoving && this.player.body.blocked.down ? "hero_attack3_run" : "hero_attack3";
        activeTime = 150;
      }

      this.player.play(currentAnimation, true);
      this.player.once("animationcomplete", (animation) => {
        if (!this.player.active || this.playerMechanics.isDead) {
          return;
        }

        if (animation.key === "hero_attack3" || animation.key === "hero_attack3_run") {
          this.comboStep = 0;
          this.comboInputWindowOpen = false;
          this.comboNextRequested = false;
        } else {
          this.comboInputWindowOpen = true;
          this.comboNextRequested = false;
          this.comboResetTimer = this.time.delayedCall(this.comboWindow, () => {
            this.comboStep = 0;
            this.comboInputWindowOpen = false;
            this.comboNextRequested = false;
            this.comboResetTimer = null;
          });
        }

        this.isAttacking = false;
      });

      this.attackHitbox.setVisible(true);
      this.attackHitbox.body.setEnable(true);
      this.time.delayedCall(activeTime, () => {
        this.attackHitbox.setVisible(false);
        this.attackHitbox.body.setEnable(false);
      });
    }

    attackEnemy(attackBox, enemy) {
      if (!this.isAttacking || !enemy.active) {
        return;
      }
      enemy.disableBody(true, true);
    }

    hitPlayer() {
      if (this.playerMechanics.isDead || this.roundState !== RoundState.RondaEnProgreso) {
        return;
      }

      const isDead = this.playerMechanics.takeDamage(1);
      this.player.setVelocityY(-220);

      if (isDead) {
        this.playerDie();
        return;
      }

      this.player.play("hero_hurt", true);
      this.time.delayedCall(250, () => {
        if (this.player.active && !this.playerMechanics.isDead && !this.isAttacking) {
          this.player.play("hero_idle", true);
        }
      });
    }

    playerDie() {
      if (this.playerMechanics.isDead === false) {
        this.playerMechanics.takeDamage(this.playerMechanics.currentHealth);
      }

      this.setRoundState(RoundState.RondaFinalizada);
      this.attackHitbox.setVisible(false);
      this.attackHitbox.body.setEnable(false);
      this.player.setVelocity(0, 0);
      this.player.body.enable = false;
      this.player.play("hero_death");

      this.time.delayedCall(900, () => {
        this.scene.start("EndGameScene", { result: "lose", roundNumber: this.roundNumber });
      });
    }
  }

  global.GameScene = GameScene;
})(window);
