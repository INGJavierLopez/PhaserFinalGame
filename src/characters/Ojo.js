(function (global) {
  class Ojo extends global.Enemy {
    static preload(scene) {
      global.Enemy.preloadDefinition(scene, this.getDefinition());
    }

    static getDefinition() {
      return {
        key: "ojo",
        displayName: "Ojo",
        attackMode: "range",
        stats: {
          baseDamage: 8,
          roundDamageBonus: 2,
          maxHealth: 40,
          moveSpeed: 115,
          attackSpeed: 1.2
        },
        movement: {
          mode: "flying",
          stopDistance: 32,
          verticalOffset: -10
        },
        body: {
          width: 52,
          height: 42,
          offsetX: 48,
          offsetY: 54
        },
        sensors: {
          melee: {
            width: 64,
            height: 44,
            offsetX: 54,
            offsetY: 2
          },
          range: {
            width: 170,
            height: 58,
            offsetX: 96,
            offsetY: 2
          }
        },
        animations: {
          idle: {
            textureKey: "ojoFlightSheet",
            path: "/assets/enemies/Flying eye/Flight.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 7,
            repeat: -1
          },
          walk: {
            textureKey: "ojoFlightSheet",
            path: "/assets/enemies/Flying eye/Flight.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 11,
            repeat: -1
          },
          attack1: {
            textureKey: "ojoAttack1Sheet",
            path: "/assets/enemies/Flying eye/Attack.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 12,
            repeat: 0,
            impactFrame: 3,
            activeFrames: 1,
            cooldownMs: 500,
            damageMultiplier: 1,
            hitbox: {
              width: 72,
              height: 44,
              offsetX: 56,
              offsetY: 2
            }
          },
          attack2: {
            textureKey: "ojoAttack2Sheet",
            path: "/assets/enemies/Flying eye/Attack2.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 10,
            repeat: 0,
            impactFrame: 5,
            activeFrames: 2,
            cooldownMs: 2400,
            damageMultiplier: 1.85,
            hitbox: {
              width: 86,
              height: 50,
              offsetX: 60,
              offsetY: 2
            }
          },
          attack3: {
            textureKey: "ojoAttack3Sheet",
            path: "/assets/enemies/Flying eye/Attack3.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 5,
            frameRate: 10,
            repeat: 0,
            impactFrame: 3,
            activeFrames: 2,
            cooldownMs: 1500,
            damageMultiplier: 1.2,
            hitbox: {
              width: 156,
              height: 52,
              offsetX: 110,
              offsetY: 2
            }
          },
          takeHit: {
            textureKey: "ojoTakeHitSheet",
            path: "/assets/enemies/Flying eye/Take Hit.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 10,
            repeat: 0
          },
          death: {
            textureKey: "ojoDeathSheet",
            path: "/assets/enemies/Flying eye/Death.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 8,
            repeat: 0
          }
        }
      };
    }
  }

  global.Ojo = Ojo;
})(window);
