(function (global) {
  class GameSceneHUD {
    constructor(scene) {
      this.scene = scene;
      this.statusText = null;
      this.infoText = null;
      this.roundBannerText = null;
      this.roundBannerTimer = null;
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

      this.updateRoundNumber(roundNumber);
    }

    updateRoundNumber(roundNumber) {
      if (this.infoText) {
        this.infoText.setText("Ronda " + roundNumber + " - Elimina todos los enemigos");
      }
    }

    showRoundBanner(roundNumber, durationSeconds) {
      const bannerDurationMs = Math.max(0, (durationSeconds || 2) * 1000);

      if (this.roundBannerTimer) {
        this.roundBannerTimer.remove(false);
        this.roundBannerTimer = null;
      }
      if (this.roundBannerText) {
        this.roundBannerText.destroy();
        this.roundBannerText = null;
      }

      this.roundBannerText = this.scene.add.text(this.scene.scale.width / 2, this.scene.scale.height / 2, "RONDA " + roundNumber, {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8
      }).setOrigin(0.5).setScrollFactor(0).setDepth(140);

      this.roundBannerTimer = this.scene.time.delayedCall(bannerDurationMs, () => {
        if (this.roundBannerText) {
          this.roundBannerText.destroy();
          this.roundBannerText = null;
        }
        this.roundBannerTimer = null;
      });

      return bannerDurationMs;
    }

    updateRoundState(roundState) {
      if (this.statusText) {
        this.statusText.setText("Estado: " + roundState);
      }
    }
  }

  global.GameSceneHUD = GameSceneHUD;
})(window);
