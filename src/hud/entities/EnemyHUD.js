(function (global) {
  class EnemyHUD {
    constructor(scene) {
      this.scene = scene;
      this.enemyText = null;
    }

    create(x, y, totalEnemies) {
      this.enemyText = this.scene.add.text(x, y, "", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      });
      this.enemyText.setScrollFactor(0);
      this.enemyText.setDepth(101);
      this.updateRemaining(totalEnemies);
    }

    updateRemaining(remainingEnemies) {
      if (!this.enemyText) {
        return;
      }
      this.enemyText.setText("Enemigos: " + remainingEnemies);
    }
  }

  global.EnemyHUD = EnemyHUD;
})(window);
