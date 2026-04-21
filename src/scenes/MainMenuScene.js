(function (global) {
  class MainMenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MainMenuScene" });
    }

    create() {
      this.add.rectangle(500, 250, 1000, 500, 0x87CEEB);

      this.add.text(500, 100, "WARRIOR ROUND SURVIVOR", {
        fontFamily: "Arial",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#000000"
      }).setOrigin(0.5);

      this.add.text(500, 210, "WASD = Move\nSPACE = Jump\nLeft Click = Attack", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#000000",
        align: "center"
      }).setOrigin(0.5);

      const startButton = this.add.text(500, 360, "JUGAR", {
        fontFamily: "Arial",
        fontSize: "30px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 20, right: 20, top: 10, bottom: 10 }
      });

      startButton.setOrigin(0.5);
      startButton.setInteractive({ useHandCursor: true });
      startButton.on("pointerover", function () {
        startButton.setStyle({ color: "#ffff00", backgroundColor: "#222222" });
      });

      startButton.on("pointerout", function () {
        startButton.setStyle({ color: "#ffffff", backgroundColor: "#000000" });
      });

      startButton.on("pointerdown", () => {
        this.scene.start("GameScene", { roundNumber: 1 });
      });
    }
  }

  global.MainMenuScene = MainMenuScene;
})(window);
