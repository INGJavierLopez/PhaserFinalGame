(function (global) {
  class HONGO extends global.Enemy {
    static preload(scene) {
      global.Enemy.preloadDefinition(scene, this.getDefinition());
    }

    static getDefinition() {
      return {
        key: "hongo",
        displayName: "HONGO",
        attackMode: "range",
        stats: {
          baseDamage: 10,
          roundDamageBonus: 2,
          maxHealth: 68,
          moveSpeed: 68,
          attackSpeed: 0.95
        },
        movement: {
          mode: "ground",
          stopDistance: 28
        },
        body: {
          width: 20,
          height: 35,
          offsetX: 65,
          offsetY: 65
        },
        sensors: {
          melee: {
            width: 75,
            height: 85,
            offsetX: 54,
            offsetY: 10
          },
          range: {
            width: 186,
            height: 70,
            offsetX: 110,
            offsetY: 8
          }
        },
        animations: {
          idle: {
            textureKey: "hongoIdleSheet",
            path: "/assets/enemies/Mushroom/Idle.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 6,
            repeat: -1
          },
          walk: {
            textureKey: "hongoRunSheet",
            path: "/assets/enemies/Mushroom/Run.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 9,
            repeat: -1
          },
          attack1: {
            textureKey: "hongoAttack1Sheet",
            path: "/assets/enemies/Mushroom/Attack.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 10,
            repeat: 0,
            impactFrame: 3,
            activeFrames: 1,
            cooldownMs: 650,
            damageMultiplier: 1,
            hitbox: {
              width: 76,
              height: 58,
              offsetX: 58,
              offsetY: 10
            }
          },
          attack2: {
            textureKey: "hongoAttack2Sheet",
            path: "/assets/enemies/Mushroom/Attack2.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 8,
            repeat: 0,
            impactFrame: 5,
            activeFrames: 2,
            cooldownMs: 2800,
            damageMultiplier: 2,
            hitbox: {
              width: 90,
              height: 60,
              offsetX: 62,
              offsetY: 10
            }
          },
          attack3: {
            textureKey: "hongoAttack3Sheet",
            path: "/assets/enemies/Mushroom/Attack3.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 10,
            frameRate: 10,
            repeat: 0,
            impactFrame: 5,
            activeFrames: 3,
            cooldownMs: 1850,
            damageMultiplier: 1.35,
            hitbox: {
              width: 178,
              height: 70,
              offsetX: 112,
              offsetY: 8
            }
          },
          takeHit: {
            textureKey: "hongoTakeHitSheet",
            path: "/assets/enemies/Mushroom/Take Hit.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 10,
            repeat: 0
          },
          death: {
            textureKey: "hongoDeathSheet",
            path: "/assets/enemies/Mushroom/Death.png",
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

  global.HONGO = HONGO;
})(window);
