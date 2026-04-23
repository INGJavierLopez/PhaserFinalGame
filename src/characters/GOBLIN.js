(function (global) {
  class GOBLIN extends global.Enemy {
    static preload(scene) {
      global.Enemy.preloadDefinition(scene, this.getDefinition());
    }

    static getDefinition() {
      return {
        key: "goblin",
        displayName: "GOBLIN",
        stats: {
          baseDamage: 12,
          roundDamageBonus: 3,
          maxHealth: 58,
          moveSpeed: 82,
          attackSpeed: 1
        },
        meleeHitBoxConfig: {       
          width: 30,
          height: 50,
          offsetX: 40,
          offsetY: 0
        },
        meleeTriggerConfig: {
          width: 74,
          height: 60,
          offsetX: 58,
          offsetY: 10
        },
        rangeTriggerConfig: {
          width: 156,
          height: 64,
          offsetX: 98,
          offsetY: 10
        },
        combatConfig: {
          combatType:[
            "melee",
            "range"
          ],
          mainAttackMode: "melee",
          canUseBothAttacks: false
        },
        movement: {
          mode: "ground",
          stopDistance: 26
        },
        body: {
          width: 20,
          height: 35,
          offsetX: 65,
          offsetY: 70
        },
        sensors: {
          melee: {
            width: 66,
            height: 56,
            offsetX: 52,
            offsetY: 12
          },
          range: {
            width: 192,
            height: 72,
            offsetX: 112,
            offsetY: 8
          }
        },
        animations: {
          idle: {
            textureKey: "goblinIdleSheet",
            path: "/assets/enemies/Goblin/Idle.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 6,
            repeat: -1
          },
          walk: {
            textureKey: "goblinRunSheet",
            path: "/assets/enemies/Goblin/Run.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 10,
            repeat: -1
          },
          attack1: {
            textureKey: "goblinAttack1Sheet",
            path: "/assets/enemies/Goblin/Attack.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 11,
            repeat: 0,
            impactFrame: 3,
            activeFrames: 1,
            cooldownMs: 600,
            damageMultiplier: 1,
            hitbox: {
              width: 78,
              height: 56,
              offsetX: 58,
              offsetY: 10
            }
          },
          attack2: {
            textureKey: "goblinAttack2Sheet",
            path: "/assets/enemies/Goblin/Attack2.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 9,
            repeat: 0,
            impactFrame: 5,
            activeFrames: 2,
            cooldownMs: 2600,
            damageMultiplier: 1.9,
            hitbox: {
              width: 92,
              height: 60,
              offsetX: 64,
              offsetY: 10
            }
          },
          attack3: {
            textureKey: "goblinAttack3Sheet",
            path: "/assets/enemies/Goblin/Attack3.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 11,
            frameRate: 11,
            repeat: 0,
            impactFrame: 5,
            activeFrames: 2,
            cooldownMs: 1800,
            damageMultiplier: 1.3,
            hitbox: {
              width: 182,
              height: 66,
              offsetX: 116,
              offsetY: 8
            }
          },
          takeHit: {
            textureKey: "goblinTakeHitSheet",
            path: "/assets/enemies/Goblin/Take Hit.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 10,
            repeat: 0
          },
          death: {
            textureKey: "goblinDeathSheet",
            path: "/assets/enemies/Goblin/Death.png",
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

  global.GOBLIN = GOBLIN;
})(window);
