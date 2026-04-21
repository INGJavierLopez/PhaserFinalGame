(function (global) {
  class EndGameHUD {
    constructor(scene) {
      this.scene = scene;
    }

    create(result, roundNumber, onReturn) {
      this.scene.add.rectangle(500, 250, 1000, 500, 0x222222);

      const message = result === "lose" ? "GAME OVER" : "RONDA SUPERADA";

      this.scene.add.text(500, 140, message, {
        fontFamily: "Arial",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#ffffff"
      }).setOrigin(0.5);

      this.scene.add.text(500, 215, "Ronda: " + roundNumber, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff"
      }).setOrigin(0.5);

      const returnButton = this.scene.add.text(500, 330, "VOLVER AL MENU", {
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
      returnButton.on("pointerdown", onReturn);
    }
  }

  global.EndGameHUD = EndGameHUD;
})(window);
