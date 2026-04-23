(function (global) {
  class SKELETON extends global.Enemy {
    static preload(scene) {
      global.Enemy.preloadDefinition(scene, this.getDefinition());
    }

    static getDefinition() {
      return {
        key: "skeleton",
        displayName: "SKELETON",
        attackMode: "melee",
        stats: {
          baseDamage: 14,
          roundDamageBonus: 3,
          maxHealth: 80,
          moveSpeed: 74,
          attackSpeed: 0.9
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
          stopDistance: 30
        },
        body: {
          width: 30,
          height: 50,
          offsetX: 60,
          offsetY: 50
        },
        sensors: {
          melee: {
            width: 74,
            height: 60,
            offsetX: 58,
            offsetY: 10
          },
          range: {
            width: 156,
            height: 64,
            offsetX: 98,
            offsetY: 10
          }
        },
        animations: {
          idle: {
            textureKey: "skeletonIdleSheet",
            path: "/assets/enemies/Skeleton/Idle.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 5,
            repeat: -1
          },
          walk: {
            textureKey: "skeletonWalkSheet",
            path: "/assets/enemies/Skeleton/Walk.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 8,
            repeat: -1
          },
          attack1: {
            textureKey: "skeletonAttack1Sheet",
            path: "/assets/enemies/Skeleton/Attack.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 10,
            repeat: 0,
            impactFrame: 3,
            activeFrames: 1,
            cooldownMs: 700,
            damageMultiplier: 1,
            hitbox: {
              width: 82,
              height: 60,
              offsetX: 60,
              offsetY: 10
            }
          },
          attack2: {
            textureKey: "skeletonAttack2Sheet",
            path: "/assets/enemies/Skeleton/Attack2.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 7,
            frameRate: 8,
            repeat: 0,
            impactFrame: 5,
            activeFrames: 2,
            cooldownMs: 3000,
            damageMultiplier: 2.15,
            hitbox: {
              width: 96,
              height: 64,
              offsetX: 66,
              offsetY: 10
            }
          },
          attack3: {
            textureKey: "skeletonAttack3Sheet",
            path: "/assets/enemies/Skeleton/Attack3.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 5,
            frameRate: 8,
            repeat: 0,
            impactFrame: 3,
            activeFrames: 2,
            cooldownMs: 2200,
            damageMultiplier: 1.2,
            hitbox: {
              width: 150,
              height: 60,
              offsetX: 94,
              offsetY: 10
            }
          },
          takeHit: {
            textureKey: "skeletonTakeHitSheet",
            path: "/assets/enemies/Skeleton/Take Hit.png",
            frameWidth: 150,
            frameHeight: 150,
            startFrame: 0,
            endFrame: 3,
            frameRate: 10,
            repeat: 0
          },
          death: {
            textureKey: "skeletonDeathSheet",
            path: "/assets/enemies/Skeleton/Death.png",
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

  global.SKELETON = SKELETON;
})(window);
