(function (global) {
  class EndGameScene extends Phaser.Scene {
    constructor() {
      super({ key: "EndGameScene" });
      this.result = "win";
      this.roundNumber = 1;
      this.endGameHUD = null;
    }

    init(data) {
      this.result = (data && data.result) || "win";
      this.roundNumber = (data && data.roundNumber) || 1;
    }

    create() {
      this.endGameHUD = new EndGameHUD(this);
      this.endGameHUD.create(this.result, this.roundNumber, () => {
        this.scene.start("MainMenuScene");
      });
    }
  }

  global.EndGameScene = EndGameScene;
})(window);
