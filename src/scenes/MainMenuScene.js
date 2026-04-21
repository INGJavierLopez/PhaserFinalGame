(function (global) {
  class MainMenuScene extends Phaser.Scene {
    constructor() {
      super({ key: "MainMenuScene" });
      this.mainMenuHUD = null;
    }

    create() {
      this.mainMenuHUD = new MainMenuHUD(this);
      this.mainMenuHUD.create(() => {
        this.scene.start("GameScene", { roundNumber: 1 });
      });
    }
  }

  global.MainMenuScene = MainMenuScene;
})(window);
