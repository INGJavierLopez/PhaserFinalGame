(function (global) {
  class PlayerMechanics {
    constructor(scene, player, maxHealth) {
      this.scene = scene;
      this.player = player;
      this.maxHealth = maxHealth || 3;
      this.currentHealth = this.maxHealth;
      this.isDead = false;
      this.healthText = null;
    }

    attachUI(x, y) {
      this.healthText = this.scene.add.text(x, y, "", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      });
      this.healthText.setScrollFactor(0);
      this.healthText.setDepth(101);
      this.refreshUI();
    }

    refreshUI() {
      if (!this.healthText) {
        return;
      }

      this.healthText.setText("Vida: " + this.currentHealth + "/" + this.maxHealth);
    }

    healToFull() {
      this.currentHealth = this.maxHealth;
      this.isDead = false;
      this.refreshUI();
    }

    takeDamage(amount) {
      if (this.isDead) {
        return true;
      }

      this.currentHealth -= amount || 1;

      if (this.currentHealth <= 0) {
        this.currentHealth = 0;
        this.isDead = true;
      }

      this.refreshUI();
      return this.isDead;
    }
  }

  global.PlayerMechanics = PlayerMechanics;
})(window);
