(function (global) {
  //instance parameters: scene, group, x, y, config
    
  class Enemy {
    static DEBUG_TEXTURE_KEY = "enemyDebugTexture";

    static preload(scene) {
      Enemy.preloadSharedAssets(scene);
    }

    static preloadSharedAssets(scene) {
      if (scene.textures.exists(Enemy.DEBUG_TEXTURE_KEY)) {
        return;
      }

      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, 2, 2);
      graphics.generateTexture(Enemy.DEBUG_TEXTURE_KEY, 2, 2);
      graphics.destroy();
    }

    static preloadDefinition(scene, definition) {
      Enemy.preloadSharedAssets(scene);

      const loadedTextureKeys = {};
      Object.keys(definition.animations).forEach((animationName) => {
        const animationConfig = definition.animations[animationName];
        if (
          !animationConfig
          || !animationConfig.textureKey
          || !animationConfig.path
          || loadedTextureKeys[animationConfig.textureKey]
          || scene.textures.exists(animationConfig.textureKey)
        ) {
          return;
        }

        scene.load.spritesheet(animationConfig.textureKey, animationConfig.path, {
          frameWidth: animationConfig.frameWidth,
          frameHeight: animationConfig.frameHeight
        });
        loadedTextureKeys[animationConfig.textureKey] = true;
      });
    }

    static buildAnimationKey(definition, animationName) {
      return definition.key + "_" + animationName;
    }

    static getScaledDamage(baseDamage, roundNumber, roundDamageBonus) {
      const currentRound = Math.max(1, roundNumber || 1);
      const perRoundBonus = Math.max(0, roundDamageBonus || 0);
      return Math.round(baseDamage + ((currentRound - 1) * perRoundBonus));
    }

    constructor(scene, group, x, y, config) {
      const enemyConfig = config || {};
      const enemyDebugConfig = enemyConfig.debugMode || {};

      this.scene = scene;
      this.group = group;
      this.definition = this.constructor.getDefinition();
      this.roundNumber = enemyConfig.roundNumber || 1;
      this.targetSprite = enemyConfig.targetSprite || null;
      this.debugMode = {
        bEnemyCanChase: typeof enemyDebugConfig.bEnemyCanChase === "boolean"
          ? enemyDebugConfig.bEnemyCanChase
          : true,
        bEnemyCanAttack: typeof enemyDebugConfig.bEnemyCanAttack === "boolean"
          ? enemyDebugConfig.bEnemyCanAttack
          : true
      };
      this.aiEnabled = false;
      this.state = "idle";
      this.isDead = false;
      this.isHurting = false;
      this.isAttacking = false;
      this.deathFinalized = false;
      this.facingDirection = 1;
      this.lockedAttackDirection = 1;
      this.lastPlayerAttackIdTaken = null;

      this.canAttack = true;
      this.attackWindupTimer = null;
      this.attackHitboxTimer = null;
      this.globalAttackCooldownTimer = null;

      // parámetros base
      this.attackWindupMs = 250;
      this.attackActiveMs = 200;
      this.globalAttackCooldownMs = 1000;
      
      this.attackImpactTimer = null;
      this.attackDeactivateTimer = null;
      this.attackHitboxOverlap = null;
      this.animationCompleteHandler = null;
      this.activeAnimationKey = null;
      this.activeAttackName = null;
      this.activeAttackDamageAmount = 0;
      this.attackHitboxHasConnected = false;
      this.isPlayerInsideMeleeZone = false;
      this.isPlayerInsideRangeZone = false;
      this.attackCooldowns = {
        attack1: 0,
        attack2: 0,
        attack3: 0
      };
      // stats
      this.baseDamage = this.definition.stats.baseDamage;
      this.roundDamageBonus = this.definition.stats.roundDamageBonus || 0;
      this.currentDamage = Enemy.getScaledDamage(this.baseDamage, this.roundNumber, this.roundDamageBonus);
      this.maxHealth = this.definition.stats.maxHealth;
      this.currentHealth = this.maxHealth;
      this.moveSpeed = this.definition.stats.moveSpeed;
      this.attackSpeed = this.definition.stats.attackSpeed || 1;

      // combat config
      this.combatConfig = this.definition.combatConfig || {};

      //overlapZones
      this.MeleeOverlapZone = null;
      this.RangeOverlapZone = null;
      this.meleeHitBoxConfig = this.definition.meleeHitBoxConfig || {};
      this.meleeTriggerConfig = this.definition.meleeTriggerConfig || {};
      this.rangeTriggerConfig = this.definition.rangeTriggerConfig || {};
      this.movementConfig = this.definition.movement || {};
      this.attackHitbox = this.scene.physics.add.sprite(x, y, "attackTexture");
      this.attackHitbox.setSize(this.meleeHitBoxConfig.width || 20, this.meleeHitBoxConfig.height || 20);
      this.attackHitbox.setVisible(false);
      this.attackHitbox.body.allowGravity = false;
      this.attackHitbox.body.setEnable(false);

      this.ensureAnimations();

      this.sprite = group.create(x, y, this.getTextureKey("idle"), 0);
      this.sprite.setCollideWorldBounds(true);
      this.sprite.setData("enemyUnit", this);

      if (this.definition.movement && this.definition.movement.mode === "flying") {
        this.sprite.body.allowGravity = false;
      }

      this.configureSpriteBody();
      this.hud = new EnemyHUD(this.scene, this);
      this.hud.create(this.currentHealth, this.maxHealth);
      this.createOverlapZones();
      this.playLoopAnimation("idle");
    }
    
    createOverlapZones()
    {
      this.overlapZones = [];
      // create overlap zones for melee and range attacks based on config, if the combat type includes them. 
      // These zones will be used to detect when the player is in range to start an attack. 
      // They will be invisible and will follow the enemy's position with their respective offsets.
      if(this.combatConfig.combatType.includes("melee"))
      {
      this.MeleeOverlapZone = this.scene.add.zone(this.sprite.x, this.sprite.y, this.meleeTriggerConfig.width, this.meleeTriggerConfig.height);
      this.MeleeOverlapZone.setPosition(this.sprite.x + this.meleeTriggerConfig.offsetX, this.sprite.y + this.meleeTriggerConfig.offsetY);
  
      this.overlapZones.push(this.MeleeOverlapZone);
      this.scene.physics.add.existing(this.MeleeOverlapZone);
      this.MeleeOverlapZone.body.setAllowGravity(false);
      this.MeleeOverlapZone.body.setImmovable(true);
      this.MeleeOverlapZone.body.setEnable(true);
      }
      if(this.combatConfig.combatType.includes("range"))
      {
      this.RangeOverlapZone = this.scene.add.zone(this.sprite.x, this.sprite.y, this.rangeTriggerConfig.width, this.rangeTriggerConfig.height);
      this.RangeOverlapZone.setPosition(this.sprite.x + this.rangeTriggerConfig.offsetX, this.sprite.y + this.rangeTriggerConfig.offsetY);
      this.overlapZones.push(this.RangeOverlapZone);
      this.scene.physics.add.existing(this.RangeOverlapZone);
      this.RangeOverlapZone.body.setAllowGravity(false);
      this.RangeOverlapZone.body.setImmovable(true);
      this.RangeOverlapZone.body.setEnable(true);
      }
      
      
    }
    // check if player is inside melee or range overlap zones, if yes, start respective attack
    checkOverlapZones()
    {
      if (
        !this.aiEnabled
        || !this.debugMode.bEnemyCanAttack
        || !this.targetSprite
        || !this.targetSprite.active
      ) {
        return;
      }
      this.CheckMeleeOverlapZone();
      this.CheckRangeOverlapZone();


      
    }
    // check if player is inside melee overlap zone, if yes, start melee attack
    CheckMeleeOverlapZone() {
        if (this.combatConfig.combatType.includes("melee") && this.MeleeOverlapZone) {
          const isMeleeOverlaping = this.scene.physics.world.overlap(this.MeleeOverlapZone, this.targetSprite);
          if (isMeleeOverlaping) {
            console.log("Player is in melee zone");
            this.startAttack("attack1");
          }
        }
      }
    // check if player is inside range overlap zone, if yes, start range attack
    CheckRangeOverlapZone(){
      if(this.combatConfig.combatType.includes("range") && this.RangeOverlapZone)
      {
        const isRangeOverlaping = this.scene.physics.world.overlap(this.RangeOverlapZone, this.targetSprite);
        if(isRangeOverlaping)
        {
          console.log("Player is in range zone");
          this.startAttack("attack1");
        }
      }
    }

    UpdateOverlapZonesLocation()
    {
      // get valid overlap zones (melee and range) and update their position to match the enemy's position + their respective offsets
      let overlapZones =[];
      overlapZones.push(this.MeleeOverlapZone ? this.MeleeOverlapZone : null);
      overlapZones.push(this.RangeOverlapZone ? this.RangeOverlapZone : null);
      // update position of overlap zones to match the enemy's position + their respective offsets
      this.overlapZones.forEach((zone) => {
        zone.setPosition(this.sprite.x, this.sprite.y);
        if (typeof zone.body.updateFromGameObject === "function") {
          zone.body.updateFromGameObject();
        }
      });

    }
    //TIMERS
    /**
     * @param {() => void} startHandler - Function executed when the timer starts
     * @param {number} durationSeconds - Duration in seconds (floats allowed)
     * @param {() => void} finishHandler - Function executed when the timer ends
     * @param {boolean} loop - Whether the timer should repeat
     */
    CreateTimer(startHandler, durationSeconds, finishHandler, loop = false) {
    // startHandler: function executed immediately when the timer is created
    // durationSeconds: duration in seconds, can be a float (.5, 1, 2.5)
    // finishHandler: function executed when the timer completes
    // loop: whether the timer repeats or not

      if (typeof startHandler === "function") {
          startHandler();
      }

      const timer = this.time.addEvent({
          delay: durationSeconds * 1000,
          callback: () => {
              if (typeof finishHandler === "function") {
                  finishHandler();
              }
          },
          callbackScope: this,
          loop: loop
      });

      return timer;
  }
    getAnimationConfig(animationName) {
      return this.definition.animations[animationName] || null;
    }

    getAnimationKey(animationName) {
      return Enemy.buildAnimationKey(this.definition, animationName);
    }

    getTextureKey(animationName) {
      const animationConfig = this.getAnimationConfig(animationName);
      return animationConfig ? animationConfig.textureKey : null;
    }

    ensureAnimations() {
      Object.keys(this.definition.animations).forEach((animationName) => {
        const animationConfig = this.definition.animations[animationName];
        const animationKey = this.getAnimationKey(animationName);
        if (this.scene.anims.exists(animationKey)) {
          return;
        }

        this.scene.anims.create({
          key: animationKey,
          frames: this.scene.anims.generateFrameNumbers(animationConfig.textureKey, {
            start: animationConfig.startFrame || 0,
            end: animationConfig.endFrame
          }),
          frameRate: animationConfig.frameRate,
          repeat: typeof animationConfig.repeat === "number" ? animationConfig.repeat : 0
        });
      });
    }

    configureSpriteBody() {
      const bodyConfig = this.definition.body || {};

      if (typeof bodyConfig.width === "number" && typeof bodyConfig.height === "number") {
        this.sprite.body.setSize(bodyConfig.width, bodyConfig.height, true);
      }

      if (typeof bodyConfig.offsetX === "number" && typeof bodyConfig.offsetY === "number") {
        this.sprite.body.setOffset(bodyConfig.offsetX, bodyConfig.offsetY);
      }
    }


    clearAnimationCompletion() {
      if (this.sprite && this.activeAnimationKey && this.animationCompleteHandler) {
        this.sprite.off("animationcomplete-" + this.activeAnimationKey, this.animationCompleteHandler, this);
      }

      this.activeAnimationKey = null;
      this.animationCompleteHandler = null;
    }

    clearAttackTimers() {
      if (this.attackImpactTimer) {
        this.attackImpactTimer.remove(false);
        this.attackImpactTimer = null;
      }

      if (this.attackDeactivateTimer) {
        this.attackDeactivateTimer.remove(false);
        this.attackDeactivateTimer = null;
      }
    }

    clearAttackHitboxOverlap() {
      if (this.attackHitboxOverlap) {
        this.attackHitboxOverlap.destroy();
        this.attackHitboxOverlap = null;
      }
    }

    hideActiveAttackHitbox() {
      this.clearAttackTimers();
      this.clearAttackHitboxOverlap();

      if (!this.activeAttackHitbox) {
        return;
      }

      this.activeAttackName = null;
      this.activeAttackDamageAmount = 0;
      this.attackHitboxHasConnected = false;
      this.activeAttackHitbox.setVisible(false);
      this.activeAttackHitbox.body.setEnable(false);
    }

    stopBodyMovement() {
      if (!this.sprite || !this.sprite.active) {
        return;
      }

      this.sprite.setVelocityX(0);
      if (this.definition.movement && this.definition.movement.mode === "flying") {
        this.sprite.setVelocityY(0);
      }
    }

    playLoopAnimation(animationName) {
      if (!this.sprite || !this.sprite.active) {
        return;
      }

      const animationKey = this.getAnimationKey(animationName);
      if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key === animationKey) {
        return;
      }

      this.sprite.play(animationKey, true);
    }

    playSingleAnimation(animationName, onComplete) {
      const animationKey = this.getAnimationKey(animationName);
      this.clearAnimationCompletion();
      this.sprite.play(animationKey, true);
      this.activeAnimationKey = animationKey;
      this.animationCompleteHandler = onComplete;
      this.sprite.once("animationcomplete-" + animationKey, onComplete, this);
    }
  
     
    setFacingDirection(nextDirection) {
      if (nextDirection === 0) {
        return;
      }

      this.facingDirection = nextDirection > 0 ? 1 : -1;
      this.sprite.setFlipX(this.facingDirection < 0);
    }

    updateFacingFromTarget() {
      if (!this.targetSprite || !this.targetSprite.active || this.isAttacking) {
        return;
      }

      const distanceToTargetX = this.targetSprite.x - this.sprite.x;
      if (Math.abs(distanceToTargetX) < 2) {
        return;
      }

      this.setFacingDirection(Math.sign(distanceToTargetX));
    }


    chaseTarget() {
      if (!this.debugMode.bEnemyCanChase || !this.targetSprite || !this.targetSprite.active) {
        this.stopBodyMovement();
        this.playLoopAnimation("idle");
        return;
      }

      const movementConfig = this.definition.movement || {};
      const stopDistance = movementConfig.stopDistance || 24;
      const distanceToTargetX = this.targetSprite.x - this.sprite.x;

      if (movementConfig.mode === "flying") {
        const desiredY = this.targetSprite.y + (movementConfig.verticalOffset || 0);
        const directionVector = new Phaser.Math.Vector2(distanceToTargetX, desiredY - this.sprite.y);

        if (directionVector.lengthSq() <= (stopDistance * stopDistance)) {
          this.stopBodyMovement();
          this.playLoopAnimation("idle");
          return;
        }

        directionVector.normalize().scale(this.moveSpeed);
        this.sprite.setVelocity(directionVector.x, directionVector.y);
        this.playLoopAnimation("walk");
        return;
      }

      if (Math.abs(distanceToTargetX) <= stopDistance) {
        this.sprite.setVelocityX(0);
        this.playLoopAnimation("idle");
        return;
      }

      this.sprite.setVelocityX(Math.sign(distanceToTargetX) * this.moveSpeed);
      this.playLoopAnimation("walk");
    }


    startAttack(attackName) {
      const attackConfig = this.getAnimationConfig(attackName);
      if (
        !attackConfig
        || this.isDead
        || this.isHurting
        || this.isAttacking
        || !this.canAttack
        || !this.aiEnabled
        || !this.debugMode.bEnemyCanAttack
      ) {
        return;
      }

      const attackWindupMs = attackConfig.attackWindupMs ?? 400;
      const attackActiveMs = attackConfig.attackActiveMs ?? 200;
      const globalAttackCooldownMs = attackConfig.globalAttackCooldownMs ?? 1000;

      this.state = "attacking";
      this.isAttacking = true;
      this.canAttack = false;
      this.activeAttackName = attackName;
      this.lockedAttackDirection = this.facingDirection;

      this.stopBodyMovement();
      this.hideActiveAttackHitbox();

      // reproducir animación del ataque
      this.playSingleAnimation(attackName, () => {
        this.clearAnimationCompletion();

        if (this.isDead) {
          return;
        }

        // al terminar la animación, si ya no está atacando, vuelve a idle
        if (!this.isAttacking) {
          this.state = "idle";

          if (this.aiEnabled) {
            this.playLoopAnimation("idle");
          }
        }
      });

      // =========================
      // WINDUP DEL ATAQUE
      // =========================
      // Esperar el windup antes de activar el hitbox para que el daño se sincronice con la animación del ataque.
      this.attackWindupTimer = this.scene.time.delayedCall(attackWindupMs, () => {
        this.attackWindupTimer = null;

        if (this.isDead || !this.isAttacking || !this.attackHitbox) {
          return;
        }

        this.attackHitbox.setPosition(
          this.sprite.x + ((this.meleeHitBoxConfig.offsetX || 0) * this.lockedAttackDirection),
          this.sprite.y + (this.meleeHitBoxConfig.offsetY || 0)
        );

        this.attackHitbox.setVisible(true);
        this.attackHitbox.body.setEnable(true);

        if (typeof this.attackHitbox.body.updateFromGameObject === "function") {
          this.attackHitbox.body.updateFromGameObject();
        }

        // overlap para daño
        this.attackHitboxOverlap = this.scene.physics.add.overlap(
          this.attackHitbox,
          this.targetSprite,
          () => {
            const damageMultiplier = attackConfig.damageMultiplier || 1;
            const damage = Math.max(1, Math.round(this.currentDamage * damageMultiplier));

            if (typeof this.scene.handleEnemyAttackHit === "function") {
              this.scene.handleEnemyAttackHit(this, attackName, damage);
            } else {
              console.log(`Enemy hit player with ${attackName} for ${damage} damage`);
            }
          },
          null,
          this
        );

        // =========================
        // TIEMPO ACTIVO DEL HITBOX
        // =========================
        this.attackHitboxTimer = this.scene.time.delayedCall(attackActiveMs, () => {
          this.attackHitboxTimer = null;

          if (!this.attackHitbox) {
            return;
          }

          this.attackHitbox.setVisible(false);
          this.attackHitbox.body.setEnable(false);

          if (this.attackHitboxOverlap) {
            this.attackHitboxOverlap.destroy();
            this.attackHitboxOverlap = null;
          }

          // termina ataque
          this.isAttacking = false;
          this.state = "idle";

          if (this.aiEnabled && !this.isDead) {
            this.playLoopAnimation("idle");
          }

          // =========================
          // COOLDOWN GENERAL
          // =========================
          this.globalAttackCooldownTimer = this.scene.time.delayedCall(globalAttackCooldownMs, () => {
            this.globalAttackCooldownTimer = null;

            if (this.isDead) {
              return;
            }

            this.canAttack = true;
          });
        });
      });
  }


    enterHurtState() {
      this.clearAttackTimers();
      this.hideActiveAttackHitbox();
      this.isAttacking = false;
      this.isHurting = true;
      this.state = "hurt";
      this.stopBodyMovement();

      this.playSingleAnimation("takeHit", () => {
        this.clearAnimationCompletion();
        if (this.isDead || this.state !== "hurt") {
          return;
        }

        this.isHurting = false;
        this.state = "idle";
        if (this.aiEnabled) {
          this.playLoopAnimation("idle");
        }
      });
    }

    finalizeDeath() {
      if (this.deathFinalized) {
        return;
      }

      this.deathFinalized = true;

      if (this.hud) {
        this.hud.destroy();
        this.hud = null;
      }

      if (this.meleeTrigger) {
        this.meleeTrigger.destroy();
        this.meleeTrigger = null;
      }

      if (this.rangeTrigger) {
        this.rangeTrigger.destroy();
        this.rangeTrigger = null;
      }

      if (this.activeAttackHitbox) {
        this.activeAttackHitbox.destroy();
        this.activeAttackHitbox = null;
      }

      if (this.sprite && this.sprite.active) {
        this.sprite.disableBody(true, true);
      }

      if (this.scene && typeof this.scene.handleEnemyDefeated === "function") {
        this.scene.handleEnemyDefeated(this);
      }
    }

    die() {
      if (this.isDead) {
        return;
      }

      this.isDead = true;
      this.isHurting = false;
      this.aiEnabled = false;
      this.state = "dead";
      this.clearAnimationCompletion();
      this.hideActiveAttackHitbox();
      this.stopBodyMovement();
      this.sprite.body.enable = false;
      if (this.hud) {
        this.hud.update();
      }

      this.playSingleAnimation("death", () => {
        this.clearAnimationCompletion();
        this.finalizeDeath();
      });
    }

    takeDamageFromPlayer(damageAmount, attackId) {
      if (this.isDead) {
        return false;
      }

      if (typeof attackId === "number" && this.lastPlayerAttackIdTaken === attackId) {
        return false;
      }

      this.lastPlayerAttackIdTaken = attackId;
      this.currentHealth = Math.max(0, this.currentHealth - Math.max(1, Math.round(damageAmount || 1)));
      if (this.hud) {
        this.hud.updateHealth(this.currentHealth, this.maxHealth);
      }

      if (this.currentHealth <= 0) {
        this.die();
        return true;
      }

      this.enterHurtState();
      return true;
    }

    update(targetSprite) {
      if (!this.sprite || !this.sprite.active || this.isDead) {
        return;
      }

      if (targetSprite) {
        this.targetSprite = targetSprite;
      }
      if (this.hud) {
        this.hud.update();
      }
      // actualizar dirección a la que mira el enemigo según la posición del jugador
      this.updateFacingFromTarget();
      // actualizar posición de las zonas de overlap para detección de ataques
      this.UpdateOverlapZonesLocation();
      // verificar si el jugador está dentro de las zonas de ataque para iniciar ataques
      if (!this.aiEnabled || !this.targetSprite || !this.targetSprite.active) {
        this.stopBodyMovement();
        if (!this.isHurting && !this.isAttacking) {
          this.playLoopAnimation("idle");
        }
        return;
      }

      this.checkOverlapZones();

      if (this.isHurting || this.isAttacking) {
        return;
      }

      if (!this.debugMode.bEnemyCanChase) {
        this.stopBodyMovement();
        this.playLoopAnimation("idle");
        return;
      }

      this.chaseTarget();
    }
    startMoving(){
    if (this.isDead) {        return;}
    this.aiEnabled = true
    
    }
    stopMoving() {
      this.aiEnabled = false;
      this.stopBodyMovement();

      if (!this.isDead && !this.isHurting && !this.isAttacking) {
        this.playLoopAnimation("idle");
      }
    }

    destroy() {
      this.clearAnimationCompletion();
      this.hideActiveAttackHitbox();
      if (this.hud) {
        this.hud.destroy();
        this.hud = null;
      }
      this.finalizeDeath();
    }
  }

  global.Enemy = Enemy;
})(window);
