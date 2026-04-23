(function (global) {
  class CharacterHUD {
    constructor(scene) {
      this.scene = scene;
      this.livesText = null;
      this.healthLabelText = null;
      this.healthValueText = null;
      this.healthBarGraphics = null;
      this.healthBarX = 0;
      this.healthBarY = 0;
      this.healthBarWidth = 180;
      this.healthBarHeight = 18;
      this.currentLives = 0;
      this.totalLives = 0;
      this.currentHealth = 0;
      this.maxHealth = 0;
    }

    create(x, y, currentLives, totalLives, currentHealth, maxHealth) {
      this.livesText = this.scene.add.text(x, y, "", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      });
      this.livesText.setScrollFactor(0);
      this.livesText.setDepth(101);

      this.healthLabelText = this.scene.add.text(x, y + 30, "Salud", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      });
      this.healthLabelText.setScrollFactor(0);
      this.healthLabelText.setDepth(101);

      this.healthBarX = x;
      this.healthBarY = y + 62;

      this.healthBarGraphics = this.scene.add.graphics();
      this.healthBarGraphics.setScrollFactor(0);
      this.healthBarGraphics.setDepth(101);

      this.healthValueText = this.scene.add.text(x, y + 88, "", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 3, bottom: 3 }
      });
      this.healthValueText.setScrollFactor(0);
      this.healthValueText.setDepth(101);

      this.updateStats(currentLives, totalLives, currentHealth, maxHealth);
    }

    updateStats(currentLives, totalLives, currentHealth, maxHealth) {
      this.currentLives = currentLives;
      this.totalLives = totalLives;
      this.currentHealth = currentHealth;
      this.maxHealth = maxHealth;
      this.render();
    }

    updateHealth(currentHealth, maxHealth) {
      this.currentHealth = currentHealth;
      this.maxHealth = maxHealth;
      this.render();
    }

    updateLives(currentLives, totalLives) {
      this.currentLives = currentLives;
      this.totalLives = totalLives;
      this.render();
    }

    render() {
      if (!this.livesText || !this.healthBarGraphics || !this.healthValueText) {
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

      this.livesText.setText("Vidas: " + this.currentLives + "/" + this.totalLives);
      this.healthValueText.setText("HP: " + this.currentHealth + "/" + this.maxHealth);

      this.healthBarGraphics.clear();
      this.healthBarGraphics.fillStyle(0x000000, 0.85);
      this.healthBarGraphics.fillRoundedRect(this.healthBarX, this.healthBarY, this.healthBarWidth, this.healthBarHeight, 6);
      this.healthBarGraphics.fillStyle(0x2f3640, 1);
      this.healthBarGraphics.fillRoundedRect(this.healthBarX + 2, this.healthBarY + 2, this.healthBarWidth - 4, this.healthBarHeight - 4, 4);

      const fillWidth = Math.floor((this.healthBarWidth - 4) * healthRatio);
      if (fillWidth > 0) {
        this.healthBarGraphics.fillStyle(healthColor, 1);
        this.healthBarGraphics.fillRoundedRect(this.healthBarX + 2, this.healthBarY + 2, fillWidth, this.healthBarHeight - 4, 4);
      }
    }
  }

  global.CharacterHUD = CharacterHUD;
})(window);
