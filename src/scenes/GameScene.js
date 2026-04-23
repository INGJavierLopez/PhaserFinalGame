(function (global) {
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: "GameScene" });
      this.roundState = RoundState.NuevaRonda;
      this.roundNumber = 1;
      this.roundBannerDurationSeconds = 1;
      this.timeBetweenRoundsSeconds = 2;
      this.playerMaxHealth = 100;
      this.playerHealth = 100;
      this.playerTotalLives = 3;
      this.playerLives = 3;
      this.roundTransitionPending = false;
      this.playerCharacter = null;
      this.enemies = null;
      this.enemyUnits = [];
      this.gameSceneHUD = null;
      this.enemyHUD = null;
      this.platforms = null;
    }

    init(data) {
      this.roundNumber = (data && data.roundNumber) || 1;
      this.roundBannerDurationSeconds = data && typeof data.roundBannerDurationSeconds === "number"
        ? Math.max(0, data.roundBannerDurationSeconds)
        : this.roundBannerDurationSeconds;
      this.timeBetweenRoundsSeconds = data && typeof data.timeBetweenRoundsSeconds === "number"
        ? Math.max(0, data.timeBetweenRoundsSeconds)
        : this.timeBetweenRoundsSeconds;
      this.playerMaxHealth = (data && data.playerMaxHealth) || 100;
      this.playerHealth = data && typeof data.playerHealth === "number"
        ? Math.max(0, Math.min(data.playerHealth, this.playerMaxHealth))
        : this.playerMaxHealth;
      this.playerTotalLives = (data && data.playerTotalLives) || 3;
      this.playerLives = data && typeof data.playerLives === "number"
        ? Math.max(0, Math.min(data.playerLives, this.playerTotalLives))
        : this.playerTotalLives;
    }

    preload() {
      MainCharacter.preload(this);
      Enemy.preload(this);
      Ojo.preload(this);
      GOBLIN.preload(this);
      HONGO.preload(this);
      SKELETON.preload(this);
      this.load.image("bg", "/assets/bg2.png");
    }

    create() {
      this.roundState = RoundState.NuevaRonda;
      this.roundTransitionPending = false;
      this.enemyUnits = [];

      this.physics.world.setBounds(0, 0, 1400, 500);
      this.cameras.main.setBounds(0, 0, 1400, 500);

      const background = this.add.image(700, 250, "bg");
      background.setDisplaySize(1400, 500);
      background.setDepth(-1);

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

      this.playerCharacter = new MainCharacter(
        this,
        this.playerMaxHealth,
        this.playerHealth,
        this.playerTotalLives,
        this.playerLives
      );
      this.playerCharacter.create(80, 420);

      this.spawnEnemiesForRound();

      this.physics.add.collider(this.playerCharacter.sprite, this.platforms);
      this.physics.add.collider(this.enemies, this.platforms, null, this.ShouldEnemyCollideWithPlatform, this);
      // Keep enemies and the player physically separated while attack damage is resolved in Enemy.update().
      this.physics.add.collider(this.playerCharacter.sprite, this.enemies);
      // OVERLAP FOR ATTACK HITBOX
      this.physics.add.overlap(this.playerCharacter.attackHitbox, this.enemies, this.PlayerHitEnemy, null, this);

      this.cameras.main.startFollow(this.playerCharacter.sprite, true, 0.08, 0.08);

      this.gameSceneHUD = new GameSceneHUD(this);
      this.gameSceneHUD.create(this.roundState, this.roundNumber);

      this.enemyHUD = new EnemyHUD(this);
      this.enemyHUD.create(16, 106, this.enemies.countActive(true));

      this.startCurrentRound();
    }

    createPlatform(x, y, width, height) {
      const platform = this.platforms.create(x, y, "platformTexture");
      platform.displayWidth = width;
      platform.displayHeight = height;
      platform.refreshBody();
    }

    ShouldEnemyCollideWithPlatform(enemySprite) {
      const enemyUnit = enemySprite ? enemySprite.getData("enemyUnit") : null;
      if (!enemyUnit || !enemyUnit.definition || !enemyUnit.definition.movement) {
        return true;
      }

      // Flying enemies keep their chase path clear by ignoring platform collisions.
      return enemyUnit.definition.movement.mode !== "flying";
    }

    getEnemyClasses() {
      return [Ojo, GOBLIN, HONGO, SKELETON];
    }

    spawnEnemy(EnemyClass, x, y) {
      const enemy = new EnemyClass(this, this.enemies, x, y, {
        roundNumber: this.roundNumber,
        targetSprite: this.playerCharacter ? this.playerCharacter.sprite : null
      });
      this.enemyUnits.push(enemy);
    }

    spawnEnemiesForRound() {
      const enemyClasses = this.getEnemyClasses();
      const spawnPoints = [
        { x: 500, y: 280 },
        { x: 900, y: 290 },
        { x: 1180, y: 210 },
        { x: 320, y: 350 },
        { x: 430, y: 250 },
        { x: 650, y: 180 },
        { x: 820, y: 260 },
        { x: 1040, y: 170 }
      ];
      const spawnQueue = [];

      for (let i = 0; i < this.roundNumber; i++) {
        enemyClasses.forEach((EnemyClass) => {
          spawnQueue.push(EnemyClass);
        });
      }

      Phaser.Utils.Array.Shuffle(spawnQueue);

      // Spawn one unit of each enemy class per round multiplier.
      for (let i = 0; i < spawnQueue.length; i++) {
        const spawnPoint = spawnPoints[i % spawnPoints.length];
        const spawnX = Phaser.Math.Clamp(spawnPoint.x + Phaser.Math.Between(-35, 35), 120, 1280);
        const spawnY = Phaser.Math.Clamp(spawnPoint.y + Phaser.Math.Between(-20, 20), 120, 380);
        this.spawnEnemy(SKELETON, spawnX, spawnY);
        break; // --- IGNORE --- Remove this break to spawn more enemies per round.
      }
    }

    removeInactiveEnemies() {
      this.enemyUnits = this.enemyUnits.filter((enemy) => enemy.sprite && enemy.sprite.active);
    }

    setEnemiesMoving(shouldMove) {
      this.removeInactiveEnemies();

      this.enemyUnits.forEach((enemy) => {
        if (shouldMove) {
          enemy.startMoving();
        } else {
          enemy.stopMoving();
        }
      });
    }

    startCurrentRound() {
      this.setRoundState(RoundState.NuevaRonda);
      this.gameSceneHUD.updateRoundNumber(this.roundNumber);
      this.enemyHUD.updateRemaining(this.enemies.countActive(true));
      this.setEnemiesMoving(false);

      const roundBannerDuration = this.gameSceneHUD.showRoundBanner(this.roundNumber, this.roundBannerDurationSeconds);
      this.time.delayedCall(roundBannerDuration, () => {
        if (!this.playerCharacter || this.playerCharacter.isDead) {
          return;
        }

        this.roundTransitionPending = false;
        this.setRoundState(RoundState.RondaEnProgreso);
        this.setEnemiesMoving(true);
      });
    }

    advanceToNextRound() {
      if (this.roundTransitionPending) {
        return;
      }

      this.roundTransitionPending = true;
      this.setRoundState(RoundState.RondaFinalizada);
      this.setEnemiesMoving(false);

      this.time.delayedCall(this.timeBetweenRoundsSeconds * 1000, () => {
        if (!this.playerCharacter || this.playerCharacter.isDead) {
          return;
        }

        this.roundNumber += 1;
        this.spawnEnemiesForRound();
        this.startCurrentRound();
      });
    }

    setRoundState(nextState) {
      this.roundState = nextState;
      if (this.gameSceneHUD) {
        this.gameSceneHUD.updateRoundState(nextState);
      }
    }

    PlayerHitEnemy(attackBox, enemySprite) {
      if (
        this.roundState !== RoundState.RondaEnProgreso ||
        !this.playerCharacter.isAttacking ||
        !enemySprite.active
      ) {
        return;
      }

      const enemyUnit = enemySprite.getData("enemyUnit");
      if (!enemyUnit) {
        return;
      }

      const attackDamage = this.playerCharacter.getCurrentAttackDamage();
      const attackId = this.playerCharacter.getCurrentAttackId();
      enemyUnit.takeDamageFromPlayer(attackDamage, attackId);
    }

    handleEnemyAttackHit(enemyUnit, attackName, damageAmount) {
      if (
        this.playerCharacter.isDead ||
        !this.playerCharacter.canTakeDamage ||
        this.roundState !== RoundState.RondaEnProgreso
      ) {
        return;
      }

      const isDead = this.playerCharacter.handleHit(damageAmount);
      if (isDead) {
        this.playerDie();
      }
    }

    handleEnemyDefeated(enemyUnit) {
      this.removeInactiveEnemies();
      if (this.enemyHUD) {
        this.enemyHUD.updateRemaining(this.enemies.countActive(true));
      }
    }

    playerDie() {
      if (this.roundTransitionPending) {
        return;
      }

      this.roundTransitionPending = true;
      this.setRoundState(RoundState.RondaFinalizada);
      this.setEnemiesMoving(false);
      this.playerCharacter.die();
      this.time.delayedCall(900, () => {
        this.scene.start("EndGameScene", { result: "lose", roundNumber: this.roundNumber });
      });
    }
    // MAIN GAME LOOP
    update() {
      // If player character is not ready, skip update
      if (!this.playerCharacter || !this.playerCharacter.sprite || !this.playerCharacter.sprite.active) {
        return;
      }

      this.playerCharacter.update(!this.playerCharacter.isDead);

      this.enemyUnits.forEach((enemy) => {
        enemy.update(this.playerCharacter.sprite);
      });

      if (this.playerCharacter.sprite.y > 560 && this.roundState === RoundState.RondaEnProgreso) {
        this.playerDie();
      }

      if (
        this.roundState === RoundState.RondaEnProgreso &&
        this.enemies.countActive(true) === 0
      ) {
        this.advanceToNextRound();
      }
    }
  }

  global.GameScene = GameScene;
})(window);
