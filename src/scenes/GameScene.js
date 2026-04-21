(function (global) {
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: "GameScene" });
      this.roundState = RoundState.NuevaRonda;
      this.roundNumber = 1;
      this.playerWon = false;
      this.playerCharacter = null;
      this.enemies = null;
      this.enemyUnits = [];
      this.gameSceneHUD = null;
      this.enemyHUD = null;
      this.platforms = null;
    }

    init(data) {
      this.roundNumber = (data && data.roundNumber) || 1;
    }

    preload() {
      MainCharacter.preload(this);
      Enemy.preload(this);
      this.load.image("bg", "/assets/bg.png");
    }

    create() {
      this.roundState = RoundState.NuevaRonda;
      this.playerWon = false;
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

      this.playerCharacter = new MainCharacter(this, 3);
      this.playerCharacter.create(80, 420);

      this.spawnEnemy(500, 280);
      this.spawnEnemy(900, 290);
      this.spawnEnemy(1180, 210);

      this.physics.add.collider(this.playerCharacter.sprite, this.platforms);
      this.physics.add.collider(this.enemies, this.platforms);
      this.physics.add.collider(this.playerCharacter.sprite, this.enemies, this.hitPlayer, null, this);
      this.physics.add.overlap(this.playerCharacter.attackHitbox, this.enemies, this.attackEnemy, null, this);

      this.cameras.main.startFollow(this.playerCharacter.sprite, true, 0.08, 0.08);

      this.gameSceneHUD = new GameSceneHUD(this);
      this.gameSceneHUD.create(this.roundState, this.roundNumber);

      this.enemyHUD = new EnemyHUD(this);
      this.enemyHUD.create(16, 106, this.enemies.countActive(true));

      this.time.delayedCall(900, () => {
        this.setRoundState(RoundState.RondaEnProgreso);
      });
    }

    createPlatform(x, y, width, height) {
      const platform = this.platforms.create(x, y, "platformTexture");
      platform.displayWidth = width;
      platform.displayHeight = height;
      platform.refreshBody();
    }

    spawnEnemy(x, y) {
      const enemy = new Enemy(this, this.enemies, x, y);
      this.enemyUnits.push(enemy);
    }

    setRoundState(nextState) {
      this.roundState = nextState;
      if (this.gameSceneHUD) {
        this.gameSceneHUD.updateRoundState(nextState);
      }
    }

    attackEnemy(attackBox, enemySprite) {
      if (!this.playerCharacter.isAttacking || !enemySprite.active) {
        return;
      }
      enemySprite.disableBody(true, true);
      this.enemyHUD.updateRemaining(this.enemies.countActive(true));
    }

    hitPlayer() {
      if (this.playerCharacter.isDead || this.roundState !== RoundState.RondaEnProgreso) {
        return;
      }

      const isDead = this.playerCharacter.handleHit();
      if (isDead) {
        this.playerDie();
      }
    }

    playerDie() {
      this.setRoundState(RoundState.RondaFinalizada);
      this.playerCharacter.die();
      this.time.delayedCall(900, () => {
        this.scene.start("EndGameScene", { result: "lose", roundNumber: this.roundNumber });
      });
    }

    update() {
      if (!this.playerCharacter || !this.playerCharacter.sprite || !this.playerCharacter.sprite.active) {
        return;
      }

      this.playerCharacter.update(this.roundState === RoundState.RondaEnProgreso);

      this.enemyUnits.forEach((enemy) => {
        enemy.update();
      });

      if (this.playerCharacter.sprite.y > 560 && this.roundState === RoundState.RondaEnProgreso) {
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
  }

  global.GameScene = GameScene;
})(window);
