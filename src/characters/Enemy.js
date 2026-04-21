(function (global) {
  class Enemy {
    static preload(scene) {
      if (!scene.textures.exists("enemyTexture")) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xe74c3c, 1);
        graphics.fillRect(0, 0, 28, 28);
        graphics.generateTexture("enemyTexture", 28, 28);
        graphics.destroy();
      }
    }

    constructor(scene, group, x, y) {
      this.scene = scene;
      this.sprite = group.create(x, y, "enemyTexture");
      this.sprite.setCollideWorldBounds(true);
      this.sprite.setVelocityX(-60);
    }

    update() {
      if (!this.sprite || !this.sprite.active) {
        return;
      }
      if (this.sprite.body.blocked.left) {
        this.sprite.setVelocityX(60);
      } else if (this.sprite.body.blocked.right) {
        this.sprite.setVelocityX(-60);
      }
    }

    destroy() {
      if (this.sprite && this.sprite.active) {
        this.sprite.disableBody(true, true);
      }
    }
  }

  global.Enemy = Enemy;
})(window);
