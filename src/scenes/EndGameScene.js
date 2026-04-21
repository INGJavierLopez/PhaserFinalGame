(function (global) {
  class EndGameScene extends Phaser.Scene {
    constructor() {
      super({ key: "EndGameScene" });
      this.result = "win";
      this.roundNumber = 1;
    }

    init(data) {
      this.result = (data && data.result) || "win";
      this.roundNumber = (data && data.roundNumber) || 1;
    }

    create() {
      this.add.rectangle(500, 250, 1000, 500, 0x222222);

      const message = this.result === "lose" ? "GAME OVER" : "RONDA SUPERADA";

      this.add.text(500, 140, message, {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#ffffff"
      }).setOrigin(0.5);

      this.add.text(500, 215, "Ronda: " + this.roundNumber, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff"
      }).setOrigin(0.5);

      const returnButton = this.add.text(500, 330, "VOLVER AL MENU", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      });

      returnButton.setOrigin(0.5);
      returnButton.setInteractive({ useHandCursor: true });
      returnButton.on("pointerover", function () {
        returnButton.setStyle({ color: "#ffff00", backgroundColor: "#444444" });
      });
      returnButton.on("pointerout", function () {
        returnButton.setStyle({ color: "#ffffff", backgroundColor: "#000000" });
      });
      returnButton.on("pointerdown", () => {
        this.scene.start("MainMenuScene");
      });
    }
  }

  global.EndGameScene = EndGameScene;
})(window);
