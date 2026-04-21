(function (global) {
  class CharacterHUD {
    constructor(scene) {
      this.scene = scene;
      this.healthText = null;
    }

    create(x, y, currentHealth, maxHealth) {
      this.healthText = this.scene.add.text(x, y, "", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      });
      this.healthText.setScrollFactor(0);
      this.healthText.setDepth(101);
      this.updateHealth(currentHealth, maxHealth);
    }

    updateHealth(currentHealth, maxHealth) {
      if (!this.healthText) {
        return;
      }
      this.healthText.setText("Vida: " + currentHealth + "/" + maxHealth);
    }
  }

  global.CharacterHUD = CharacterHUD;
})(window);
