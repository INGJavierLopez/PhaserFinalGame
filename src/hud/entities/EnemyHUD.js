(function (global) {
  class EnemyHUD {
    constructor(scene, enemyUnit) {
      this.scene = scene;
      this.enemyUnit = enemyUnit;
      this.healthBarGraphics = null;
      this.healthBarWidth = 42;
      this.healthBarHeight = 8;
      this.verticalOffset = -40;
      this.currentHealth = 0;
      this.maxHealth = 0;
    }

    create(currentHealth, maxHealth) {
      this.healthBarGraphics = this.scene.add.graphics();
      this.healthBarGraphics.setDepth(30);
      this.updateHealth(currentHealth, maxHealth);
    }

    updateHealth(currentHealth, maxHealth) {
      this.currentHealth = currentHealth;
      this.maxHealth = maxHealth;
      this.render();
    }

    update() {
      this.render();
    }

    render() {
      if (!this.healthBarGraphics) {
        return;
      }

      const enemySprite = this.enemyUnit ? this.enemyUnit.sprite : null;
      if (!enemySprite || !enemySprite.active || this.enemyUnit.isDead) {
        this.healthBarGraphics.setVisible(false);
        this.healthBarGraphics.clear();
        return;
      }

      const healthRatio = this.maxHealth > 0
        ? Phaser.Math.Clamp(this.currentHealth / this.maxHealth, 0, 1)
        : 0;
      let healthColor = 0x2ecc71;

      if (healthRatio <= 0.33) {
        healthColor = 0xe74c3c;
      } else if (healthRatio <= 0.66) {
        healthColor = 0xf1c40f;
      }

      const barX = enemySprite.x - (this.healthBarWidth / 2);
      const barY = enemySprite.y - ((enemySprite.displayHeight || enemySprite.height || 0) / 2) - this.verticalOffset;
      const innerBarWidth = this.healthBarWidth - 2;
      const innerBarHeight = this.healthBarHeight - 2;
      const fillWidth = Math.floor(innerBarWidth * healthRatio);

      this.healthBarGraphics.setVisible(true);
      this.healthBarGraphics.clear();
      this.healthBarGraphics.fillStyle(0x000000, 0.85);
      this.healthBarGraphics.fillRoundedRect(barX, barY, this.healthBarWidth, this.healthBarHeight, 4);
      this.healthBarGraphics.fillStyle(0x2f3640, 1);
      this.healthBarGraphics.fillRoundedRect(barX + 1, barY + 1, innerBarWidth, innerBarHeight, 3);

      if (fillWidth > 0) {
        this.healthBarGraphics.fillStyle(healthColor, 1);
        this.healthBarGraphics.fillRoundedRect(barX + 1, barY + 1, fillWidth, innerBarHeight, 3);
      }
    }

    destroy() {
      if (this.healthBarGraphics) {
        this.healthBarGraphics.destroy();
        this.healthBarGraphics = null;
      }
    }
  }

  global.EnemyHUD = EnemyHUD;
})(window);
