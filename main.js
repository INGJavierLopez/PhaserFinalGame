(function () {
  const config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 1000,
    height: 500,
    backgroundColor: "#87CEEB",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 900 },
        debug: true
      }
    },
    scene: [MainMenuScene, GameScene, EndGameScene]
  };

  new Phaser.Game(config);
})();
