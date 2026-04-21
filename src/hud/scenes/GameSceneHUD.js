(function (global) {
  class GameSceneHUD {
    constructor(scene) {
      this.scene = scene;
      this.statusText = null;
      this.infoText = null;
    }

    create(roundState, roundNumber) {
      this.statusText = this.scene.add.text(16, 16, "Estado: " + roundState, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setScrollFactor(0).setDepth(100);

      this.infoText = this.scene.add.text(16, 46, "Ronda " + roundNumber + " - Elimina todos los enemigos", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setScrollFactor(0).setDepth(100);
    }

    updateRoundState(roundState) {
      if (this.statusText) {
        this.statusText.setText("Estado: " + roundState);
      }
    }
  }

  global.GameSceneHUD = GameSceneHUD;
})(window);
