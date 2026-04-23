(function (global) {
  class MainCharacter {
    static preload(scene) {
      if (!scene.textures.exists("platformTexture")) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xEDC9AF, 1);
        graphics.fillRect(0, 0, 64, 20);
        graphics.generateTexture("platformTexture", 64, 20);
        graphics.clear();

        graphics.fillStyle(0xffffff, 0.35);
        graphics.fillRect(0, 0, 40, 20);
        graphics.generateTexture("attackTexture", 40, 20);
        graphics.destroy();
      }

      scene.load.spritesheet("heroIdle", "/assets/character/IDLE.png", { frameWidth: 96, frameHeight: 84 });
      scene.load.spritesheet("heroRun", "/assets/character/RUN.png", { frameWidth: 96, frameHeight: 84 });
      scene.load.spritesheet("heroJump", "/assets/character/JUMP.png", { frameWidth: 96, frameHeight: 84 });
      scene.load.spritesheet("heroAttack1", "/assets/character/ATTACK 1.png", { frameWidth: 96, frameHeight: 84 });
      scene.load.spritesheet("heroAttack2", "/assets/character/ATTACK 2.png", { frameWidth: 96, frameHeight: 84 });
      scene.load.spritesheet("heroAttack3", "/assets/character/ATTACK 3.png", { frameWidth: 96, frameHeight: 84 });
      scene.load.spritesheet("heroAttack3RUN", "/assets/character/ATTACK 3 RUN.png", { frameWidth: 96, frameHeight: 84 });
      scene.load.spritesheet("heroDeath", "/assets/character/DEATH.png", { frameWidth: 96, frameHeight: 84 });
      scene.load.spritesheet("heroHurt", "/assets/character/HURT.png", { frameWidth: 96, frameHeight: 84 });
    }

    constructor(scene, maxHealth, currentHealth, totalLives, currentLives) {
      this.scene = scene;
      this.maxHealth = maxHealth || 100;
      this.totalLives = totalLives || 3;
      this.currentLives = typeof currentLives === "number"
        ? Math.max(0, Math.min(currentLives, this.totalLives))
        : this.totalLives;
      this.currentHealth = typeof currentHealth === "number"
        ? Math.max(0, Math.min(currentHealth, this.maxHealth))
        : this.maxHealth;
      this.actionState = "normal";
      this.isDead = false;
      this.canTakeDamage = true;
      this.facingRight = true;
      this.isAttacking = false;
      this.isHurting = false;
      this.comboStep = 0;
      this.comboWindow = 500;
      this.comboInputWindowOpen = false;
      this.comboNextRequested = false;
      this.comboResetTimer = null;
      this.attackHitboxTimer = null;
      this.activeAttackAnimationKey = null;
      this.attackAnimationCompleteHandler = null;
      this.hurtAnimationCompleteHandler = null;
      this.currentAttackId = 0;
      this.sprite = null;
      this.attackHitbox = null;
      this.keys = null;
      this.hud = new CharacterHUD(scene);
    }

    create(x, y) {
      this.ensureAnimations();
      this.sprite = this.scene.physics.add.sprite(x, y, "heroIdle", 0);
      this.sprite.setCollideWorldBounds(true);
      this.sprite.body.setSize(28, 44);
      this.sprite.body.setOffset(18, 18);
      this.sprite.play("hero_idle");

      this.attackHitbox = this.scene.physics.add.sprite(x, y, "attackTexture");
      this.attackHitbox.setVisible(false);
      this.attackHitbox.body.allowGravity = false;
      this.attackHitbox.body.setEnable(false);

      this.keys = this.scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.SPACE,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
      });

      this.scene.input.on("pointerdown", function (pointer) {
        if (pointer.leftButtonDown()) {
          this.attack();
        }
      }, this);

      this.hud.create(16, 76, this.currentLives, this.totalLives, this.currentHealth, this.maxHealth);
    }

    ensureAnimations() {
      if (!this.scene.anims.exists("hero_idle")) {
        this.scene.anims.create({ key: "hero_idle", frames: this.scene.anims.generateFrameNumbers("heroIdle", { start: 0, end: 6 }), frameRate: 8, repeat: -1 });
      }
      if (!this.scene.anims.exists("hero_run")) {
        this.scene.anims.create({ key: "hero_run", frames: this.scene.anims.generateFrameNumbers("heroRun", { start: 0, end: 7 }), frameRate: 12, repeat: -1 });
      }
      if (!this.scene.anims.exists("hero_attack1")) {
        this.scene.anims.create({ key: "hero_attack1", frames: this.scene.anims.generateFrameNumbers("heroAttack1", { start: 0, end: 5 }), frameRate: 32, repeat: 0 });
      }
      if (!this.scene.anims.exists("hero_attack2")) {
        this.scene.anims.create({ key: "hero_attack2", frames: this.scene.anims.generateFrameNumbers("heroAttack2", { start: 0, end: 4 }), frameRate: 12, repeat: 0 });
      }
      if (!this.scene.anims.exists("hero_attack3")) {
        this.scene.anims.create({ key: "hero_attack3", frames: this.scene.anims.generateFrameNumbers("heroAttack3", { start: 0, end: 5 }), frameRate: 10, repeat: 0 });
      }
      if (!this.scene.anims.exists("hero_attack3_run")) {
        this.scene.anims.create({ key: "hero_attack3_run", frames: this.scene.anims.generateFrameNumbers("heroAttack3RUN", { start: 0, end: 5 }), frameRate: 10, repeat: 0 });
      }
      if (!this.scene.anims.exists("hero_hurt")) {
        this.scene.anims.create({ key: "hero_hurt", frames: this.scene.anims.generateFrameNumbers("heroHurt", { start: 0, end: 3 }), frameRate: 12, repeat: 0 });
      }
      if (!this.scene.anims.exists("hero_death")) {
        this.scene.anims.create({ key: "hero_death", frames: this.scene.anims.generateFrameNumbers("heroDeath", { start: 0, end: 11 }), frameRate: 10, repeat: 0 });
      }
    }

    setActionState(nextState) {
      this.actionState = nextState;
      this.isAttacking = nextState === "attack";
      this.isHurting = nextState === "hurt";
    }

    clearComboResetTimer() {
      if (this.comboResetTimer) {
        this.comboResetTimer.remove(false);
        this.comboResetTimer = null;
      }
    }

    clearAttackHitboxTimer() {
      if (this.attackHitboxTimer) {
        this.attackHitboxTimer.remove(false);
        this.attackHitboxTimer = null;
      }
    }

    disableAttackHitbox() {
      this.clearAttackHitboxTimer();

      if (!this.attackHitbox) {
        return;
      }

      this.attackHitbox.setVisible(false);
      this.attackHitbox.body.setEnable(false);
    }

    clearAttackAnimationCompletion() {
      if (this.sprite && this.activeAttackAnimationKey && this.attackAnimationCompleteHandler) {
        this.sprite.off("animationcomplete-" + this.activeAttackAnimationKey, this.attackAnimationCompleteHandler, this);
      }

      this.activeAttackAnimationKey = null;
      this.attackAnimationCompleteHandler = null;
    }

    clearHurtAnimationCompletion() {
      if (this.sprite && this.hurtAnimationCompleteHandler) {
        this.sprite.off("animationcomplete-hero_hurt", this.hurtAnimationCompleteHandler, this);
      }

      this.hurtAnimationCompleteHandler = null;
    }

    resetComboState() {
      this.clearComboResetTimer();
      this.comboStep = 0;
      this.comboInputWindowOpen = false;
      this.comboNextRequested = false;
    }

    cancelAttackSequence() {
      this.clearAttackAnimationCompletion();
      this.resetComboState();
      this.disableAttackHitbox();

      if (this.actionState === "attack") {
        this.setActionState("normal");
      }
    }

    updateHUD() {
      this.hud.updateStats(this.currentLives, this.totalLives, this.currentHealth, this.maxHealth);
    }

    update(canAct) {
      if (!this.sprite || !this.sprite.active || this.isDead || !canAct) {
        return;
      }

      const moveSpeed = 180;
      const jumpForce = -500;
      this.sprite.setVelocityX(0);

      if (this.keys.left.isDown) {
        this.sprite.setVelocityX(-moveSpeed);
        this.facingRight = false;
        this.sprite.flipX = true;
      } else if (this.keys.right.isDown) {
        this.sprite.setVelocityX(moveSpeed);
        this.facingRight = true;
        this.sprite.flipX = false;
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.up) && this.sprite.body.blocked.down) {
        this.sprite.setVelocityY(jumpForce);
      }

      if (this.actionState === "normal") {
        if (!this.sprite.body.blocked.down) {
          this.updateJumpFrame();
        } else if (this.keys.left.isDown || this.keys.right.isDown) {
          this.sprite.play("hero_run", true);
        } else {
          this.sprite.play("hero_idle", true);
        }
      }

      this.attackHitbox.x = this.facingRight ? this.sprite.x + 26 : this.sprite.x - 26;
      this.attackHitbox.y = this.sprite.y;

      if (this.actionState === "normal" && this.comboInputWindowOpen && this.comboNextRequested) {
        this.comboInputWindowOpen = false;
        this.comboNextRequested = false;

        if (this.comboStep === 1) {
          this.startComboAttack(2);
        } else if (this.comboStep === 2) {
          this.startComboAttack(3);
        }
      }
    }

    updateJumpFrame() {
      this.sprite.setTexture("heroJump");

      if (this.sprite.body.velocity.y < -40) {
        this.sprite.setFrame(this.sprite.body.velocity.y < -220 ? 0 : 1);
      } else if (this.sprite.body.velocity.y <= 40) {
        this.sprite.setFrame(2);
      } else {
        this.sprite.setFrame(this.sprite.body.velocity.y < 220 ? 3 : 4);
      }
    }

    attack() {
      if (!this.sprite.active || this.isDead || this.actionState !== "normal") {
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

    getCurrentAttackId() {
      return this.currentAttackId;
    }

    getCurrentAttackDamage() {
      if (this.comboStep === 2) {
        return 28;
      }
      if (this.comboStep === 3) {
        return 42;
      }

      return 18;
    }

    startComboAttack(attackNumber) {
      this.setActionState("attack");
      this.comboInputWindowOpen = false;
      this.comboNextRequested = false;
      this.clearComboResetTimer();
      this.clearAttackAnimationCompletion();
      this.clearHurtAnimationCompletion();

      this.comboStep = attackNumber;
      // Generate a stable id per swing so enemies only take damage once per player attack.
      this.currentAttackId += 1;
      this.sprite.setVelocityX(0);

      let currentAnimation = "hero_attack1";
      let activeTime = 120;

      if (this.comboStep === 2) {
        currentAnimation = "hero_attack2";
      }
      if (this.comboStep === 3) {
        const isMoving = this.keys.left.isDown || this.keys.right.isDown;
        currentAnimation = isMoving && this.sprite.body.blocked.down ? "hero_attack3_run" : "hero_attack3";
        activeTime = 350;
      }

      this.sprite.play(currentAnimation, true);
      this.activeAttackAnimationKey = currentAnimation;
      this.attackAnimationCompleteHandler = () => {
        this.activeAttackAnimationKey = null;
        this.attackAnimationCompleteHandler = null;

        if (!this.sprite.active || this.isDead || this.actionState !== "attack") {
          return;
        }

        if (currentAnimation === "hero_attack3" || currentAnimation === "hero_attack3_run") {
          this.resetComboState();
        } else {
          this.comboInputWindowOpen = true;
          this.comboNextRequested = false;
          this.comboResetTimer = this.scene.time.delayedCall(this.comboWindow, () => {
            this.resetComboState();
          });
        }

        this.setActionState("normal");
      };
      this.sprite.once("animationcomplete-" + currentAnimation, this.attackAnimationCompleteHandler, this);

      this.attackHitbox.setVisible(true);
      this.attackHitbox.body.setEnable(true);
      this.clearAttackHitboxTimer();
      this.attackHitboxTimer = this.scene.time.delayedCall(activeTime, () => {
        this.attackHitboxTimer = null;
        if (!this.attackHitbox) {
          return;
        }

        this.attackHitbox.setVisible(false);
        this.attackHitbox.body.setEnable(false);
      });
    }

    handleHit(damageAmount) {
      if (this.isDead) {
        return true;
      }
      if (!this.canTakeDamage) {
        return false;
      }

      const isDead = this.takeDamage(damageAmount);
      this.canTakeDamage = false;
      this.cancelAttackSequence();
      this.clearHurtAnimationCompletion();
      this.sprite.setVelocityY(-400);

      if (!isDead) {
        this.setActionState("hurt");
        this.sprite.play("hero_hurt", true);
        this.hurtAnimationCompleteHandler = () => {
          this.hurtAnimationCompleteHandler = null;

          if (!this.sprite.active || this.isDead || this.actionState !== "hurt") {
            return;
          }

          this.setActionState("normal");
          this.canTakeDamage = true;
        };
        this.sprite.once("animationcomplete-hero_hurt", this.hurtAnimationCompleteHandler, this);
      }

      return isDead;
    }

    takeDamage(amount) {
      if (this.isDead) {
        return true;
      }
      if (!this.canTakeDamage) {
        return false;
      }

      const damageAmount = Math.max(1, Math.round(amount || 1));
      this.currentHealth -= damageAmount;
      if (this.currentHealth <= 0) {
        this.currentLives -= 1;

        if (this.currentLives <= 0) {
          this.currentLives = 0;
          this.currentHealth = 0;
          this.isDead = true;
        } else {
          this.currentHealth = this.maxHealth;
        }
      }

      this.updateHUD();
      return this.isDead;
    }

    die() {
      this.clearAttackAnimationCompletion();
      this.clearHurtAnimationCompletion();
      this.resetComboState();
      this.disableAttackHitbox();
      this.currentHealth = 0;
      this.currentLives = 0;
      this.isDead = true;
      this.canTakeDamage = false;
      this.updateHUD();
      this.sprite.setVelocity(0, 0);
      this.sprite.body.enable = false;
      this.setActionState("dead");
      this.sprite.play("hero_death");
    }
  }

  global.MainCharacter = MainCharacter;
})(window);
