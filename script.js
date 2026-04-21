var config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 1000,
    height: 500,
    backgroundColor: "#87CEEB",

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },

    // The game uses three scenes:
    // main menu, gameplay, and end screen
    scene: [MainMenuScene, GameScene, EndGameScene]
};

var game = new Phaser.Game(config);

// Global variables used in the game
var player;
var keys;
var platforms;
var enemies;

// Attack
var attackHitbox;
var canAttack = true;
var isAttacking = false;
var attackCooldown = 300;
var comboStep = 0;
var comboResetTimer = null;
var attackQueued = false;
var comboWindow = 500;
var comboInputWindowOpen = false;
var comboNextRequested = false;

var facingRight = true;
var goal;
var statusText;
var infoText;
var playerWon = false;
var playerDead = false;

function MainMenuScene() {
    Phaser.Scene.call(this, { key: "MainMenuScene" });
}

MainMenuScene.prototype = Object.create(Phaser.Scene.prototype);
MainMenuScene.prototype.constructor = MainMenuScene;

MainMenuScene.prototype.preload = function ()
{
};

MainMenuScene.prototype.create = function ()
{
    this.add.rectangle(250, 250, 500, 500, 0x87CEEB);

    this.add.text(250, 80, "PLATFORMER TEMPLATE", {
        fontFamily: "Arial",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#000000"
    }).setOrigin(0.5);

    this.add.text(250, 180, "WASD = Move\nSPACE = Jump\nLeft Click = Attack", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#000000",
        align: "center"
    }).setOrigin(0.5);

    var startButton = this.add.text(250, 360, "START GAME", {
        fontFamily: "Arial",
        fontSize: "26px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    });

    startButton.setOrigin(0.5);
    startButton.setInteractive({ useHandCursor: true });

    startButton.on("pointerover", function () {
        startButton.setStyle({
            color: "#ffff00",
            backgroundColor: "#222222"
        });
    });

    startButton.on("pointerout", function () {
        startButton.setStyle({
            color: "#ffffff",
            backgroundColor: "#000000"
        });
    });

    startButton.on("pointerdown", function () {
        this.scene.start("GameScene");
    }, this);
};

MainMenuScene.prototype.update = function ()
{
};

function GameScene() {
    Phaser.Scene.call(this, { key: "GameScene" });
}

GameScene.prototype = Object.create(Phaser.Scene.prototype);
GameScene.prototype.constructor = GameScene;

GameScene.prototype.preload = function ()
{
    var graphics = this.add.graphics();

    graphics.fillStyle(0xEDC9AF, 1); // color arena claro
    graphics.fillRect(0, 0, 64, 20);
    graphics.generateTexture("platformTexture", 64, 20);
    graphics.clear();

    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillRect(0, 0, 28, 28);
    graphics.generateTexture("enemyTexture", 28, 28);
    graphics.clear();

    graphics.fillStyle(0xf1c40f, 1);
    graphics.fillRect(0, 0, 18, 30);
    graphics.generateTexture("goalTexture", 18, 30);
    graphics.clear();

    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillRect(0, 0, 40, 20);
    graphics.generateTexture("attackTexture", 40, 20);
    graphics.destroy();

    // Hero spritesheets
    this.load.spritesheet("heroIdle", "/assets/IDLE.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroRun", "/assets/RUN.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroJump", "/assets/JUMP.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroAttack1", "/assets/ATTACK 1.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroAttack2", "/assets/ATTACK 2.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroAttack3", "/assets/ATTACK 3.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroAttack3RUN", "/assets/ATTACK 3 RUN.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroDeath", "/assets/DEATH.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroHurt", "/assets/HURT.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroWalk", "/assets/WALK.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.spritesheet("heroDefend", "/assets/DEFEND.png", {
        frameWidth: 96,
        frameHeight: 84
    });

    this.load.image("bg", "/assets/bg.png");
};

GameScene.prototype.create = function ()
{
    playerWon = false;
    canAttack = true;
    isAttacking = false;
    playerDead = false;
    comboStep = 0;
    attackQueued = false;

    if (comboResetTimer) {
        comboResetTimer.remove(false);
        comboResetTimer = null;
    }

    this.physics.world.setBounds(0, 0, 1400, 500);
    this.cameras.main.setBounds(0, 0, 1400, 500);

    // Background
    var background = this.add.image(700, 250, "bg");
    background.setDisplaySize(1400, 500);
    background.setDepth(-1);

    // Create hero animations once
    if (!this.anims.exists("hero_idle")) {
        this.anims.create({
            key: "hero_idle",
            frames: this.anims.generateFrameNumbers("heroIdle", { start: 0, end: 6 }),
            frameRate: 8,
            repeat: -1
        });
    }

    if (!this.anims.exists("hero_run")) {
        this.anims.create({
            key: "hero_run",
            frames: this.anims.generateFrameNumbers("heroRun", { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });
    }

    if (!this.anims.exists("hero_attack1")) {
        this.anims.create({
            key: "hero_attack1",
            frames: this.anims.generateFrameNumbers("heroAttack1", { start: 0, end: 5 }),
            frameRate: 32,
            repeat: 0
        });
    }

    if (!this.anims.exists("hero_attack2")) {
        this.anims.create({
            key: "hero_attack2",
            frames: this.anims.generateFrameNumbers("heroAttack2", { start: 0, end: 4 }),
            frameRate: 12,
            repeat: 0
        });
    }

    if (!this.anims.exists("hero_attack3")) {
        this.anims.create({
            key: "hero_attack3",
            frames: this.anims.generateFrameNumbers("heroAttack3", { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });
    }

    if (!this.anims.exists("hero_attack3_run")) {
    this.anims.create({
        key: "hero_attack3_run",
        frames: this.anims.generateFrameNumbers("heroAttack3RUN", { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });
}

    if (!this.anims.exists("hero_death")) {
        this.anims.create({
            key: "hero_death",
            frames: this.anims.generateFrameNumbers("heroDeath", { start: 0, end: 11 }),
            frameRate: 10,
            repeat: 0
        });
    }

    if (!this.anims.exists("hero_hurt")) {
        this.anims.create({
            key: "hero_hurt",
            frames: this.anims.generateFrameNumbers("heroHurt", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });
    }

    // Groups
    platforms = this.physics.add.staticGroup();
    enemies = this.physics.add.group();

    // Ground and platforms
    CreatePlatform(this, 250, 490, 500, 20);
    CreatePlatform(this, 750, 490, 500, 20);
    CreatePlatform(this, 1150, 490, 500, 20);

    CreatePlatform(this, 250, 390, 120, 20);
    CreatePlatform(this, 430, 320, 120, 20);
    CreatePlatform(this, 650, 260, 120, 20);
    CreatePlatform(this, 880, 330, 120, 20);
    CreatePlatform(this, 1100, 250, 120, 20);

    // Player
    player = this.physics.add.sprite(80, 420, "heroIdle", 0);
    player.setCollideWorldBounds(true);
    player.setBounce(0);
    player.setScale(1.0);
    player.body.setSize(28, 44);
    player.body.setOffset(18, 18);
    player.play("hero_idle");

    player.on("animationcomplete", function (animation) {

    if (playerDead || !player.active) {
        return;
    }

    if (
    animation.key === "hero_attack1" ||
    animation.key === "hero_attack2" ||
    animation.key === "hero_attack3" ||
    animation.key === "hero_attack3_run"
    )    {
        isAttacking = false;
        canAttack = true;

        // Si fue el tercer ataque, termina el combo
        if (
            animation.key === "hero_attack3" ||
            animation.key === "hero_attack3_run"
        ) {
            comboStep = 0;
            comboInputWindowOpen = false;
            comboNextRequested = false;

            if (!player.body.blocked.down) {
                UpdateJumpFrame();
            }
            else if (keys.left.isDown || keys.right.isDown) {
                player.play("hero_run", true);
            }
            else {
                player.play("hero_idle", true);
            }

            return;
        }

        // Abrimos ventana para continuar combo
        comboInputWindowOpen = true;
        comboNextRequested = false;

        if (comboResetTimer) {
            comboResetTimer.remove(false);
        }

        comboResetTimer = this.time.delayedCall(comboWindow, function () {
            comboStep = 0;
            comboInputWindowOpen = false;
            comboNextRequested = false;
            comboResetTimer = null;

            if (!isAttacking)
            {
                if (!player.body.blocked.down) {
                    UpdateJumpFrame();
                }
                else if (keys.left.isDown || keys.right.isDown) {
                    player.play("hero_run", true);
                }
                else {
                    player.play("hero_idle", true);
                }
            }
        });

    }
}, this);


    // Attack hitbox
    attackHitbox = this.physics.add.sprite(player.x, player.y, "attackTexture");
    attackHitbox.setVisible(false);
    attackHitbox.body.allowGravity = false;
    attackHitbox.body.setEnable(false);

    // Enemies
    /*
    CreateEnemy(this, 500, 280);
    CreateEnemy(this, 900, 290);
    CreateEnemy(this, 1180, 210);
    
*/
    // Goal
    goal = this.physics.add.staticSprite(1320, 440, "goalTexture");

    // Collisions
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(player, enemies, HitPlayer, null, this);
    this.physics.add.overlap(attackHitbox, enemies, AttackEnemy, null, this);
    this.physics.add.overlap(player, goal, ReachGoal, null, this);

    // Camera follow
    this.cameras.main.startFollow(player, true, 0.08, 0.08);

    // Controls
    keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.SPACE,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.input.on("pointerdown", function (pointer) {
        if (pointer.leftButtonDown()) {
            PlayerAttack(this);
        }
    }, this);

    // UI
    statusText = this.add.text(16, 16, "Reach the goal", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
    });
    statusText.setScrollFactor(0);
    statusText.setDepth(100);

    infoText = this.add.text(16, 46, "WASD to move, SPACE to jump, Left Click to attack", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
    });
    infoText.setScrollFactor(0);
    infoText.setDepth(100);
};

GameScene.prototype.update = function ()
{
    if (!player.active || playerDead) {
        return;
    }

    var moveSpeed = 180;
    var jumpForce = -500;

    player.setVelocityX(0);

    // Horizontal movement
    if (keys.left.isDown)
    {
        player.setVelocityX(-moveSpeed);
        facingRight = false;
        player.flipX = true;
    }
    else if (keys.right.isDown)
    {
        player.setVelocityX(moveSpeed);
        facingRight = true;
        player.flipX = false;
    }

    // Jump with one press only
    if (Phaser.Input.Keyboard.JustDown(keys.up) && player.body.blocked.down)
    {
        player.setVelocityY(jumpForce);
    }

    // Ground animations only if not attacking
    if (!isAttacking)
    {
        if (!player.body.blocked.down)
        {
            UpdateJumpFrame();
        }
        else
        {
            if (keys.left.isDown || keys.right.isDown)
            {
                if (player.texture.key !== "heroRun" || !player.anims.isPlaying || player.anims.currentAnim.key !== "hero_run") {
                    player.play("hero_run", true);
                }
            }
            else
            {
                if (player.texture.key !== "heroIdle" || !player.anims.isPlaying || player.anims.currentAnim.key !== "hero_idle") {
                    player.play("hero_idle", true);
                }
            }
        }
    }

    // Update attack hitbox position
    if (facingRight)
    {
        attackHitbox.x = player.x + 26;
    }
    else
    {
        attackHitbox.x = player.x - 26;
    }

    attackHitbox.y = player.y;

    // Enemy patrol
    enemies.children.iterate(function (enemy) {
        if (!enemy || !enemy.active) {
            return;
        }

        if (enemy.body.blocked.left) {
            enemy.setVelocityX(60);
        }
        else if (enemy.body.blocked.right) {
            enemy.setVelocityX(-60);
        }
    });

    if (!isAttacking && comboInputWindowOpen && comboNextRequested)
    {
        comboInputWindowOpen = false;
        comboNextRequested = false;

        if (comboStep === 1) {
            StartComboAttack(this, 2);
        }
        else if (comboStep === 2) {
            StartComboAttack(this, 3);
        }
    }

    // Fall out of the map
    if (player.y > 560)
    {
        this.scene.start("EndGameScene", { result: "lose" });
    }
};

function EndGameScene() {
    Phaser.Scene.call(this, { key: "EndGameScene" });
}

EndGameScene.prototype = Object.create(Phaser.Scene.prototype);
EndGameScene.prototype.constructor = EndGameScene;

EndGameScene.prototype.init = function (data)
{
    this.result = data.result || "win";
};

EndGameScene.prototype.create = function ()
{
    this.add.rectangle(250, 250, 500, 500, 0x222222);

    var message = "YOU WIN!";
    if (this.result === "lose") {
        message = "GAME OVER";
    }

    this.add.text(250, 150, message, {
        fontFamily: "Arial",
        fontSize: "36px",
        fontStyle: "bold",
        color: "#ffffff"
    }).setOrigin(0.5);

    var returnButton = this.add.text(250, 320, "RETURN TO MAIN MENU", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    });

    returnButton.setOrigin(0.5);
    returnButton.setInteractive({ useHandCursor: true });

    returnButton.on("pointerover", function () {
        returnButton.setStyle({
            color: "#ffff00",
            backgroundColor: "#444444"
        });
    });

    returnButton.on("pointerout", function () {
        returnButton.setStyle({
            color: "#ffffff",
            backgroundColor: "#000000"
        });
    });

    returnButton.on("pointerdown", function () {
        this.scene.start("MainMenuScene");
    }, this);
};

// Creates a static platform with a custom size
function CreatePlatform(scene, x, y, width, height)
{
    var platform = platforms.create(x, y, "platformTexture");
    platform.displayWidth = width;
    platform.displayHeight = height;
    platform.refreshBody();
    return platform;
}

// Creates a simple enemy that patrols horizontally

function CreateEnemy(scene, x, y)
{
    var enemy = enemies.create(x, y, "enemyTexture");
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0);
    enemy.setVelocityX(-60);
    return enemy;
}


// Handles jump visual state by vertical speed
function UpdateJumpFrame()
{
    player.setTexture("heroJump");

    if (player.body.velocity.y < -40)
    {
        if (player.body.velocity.y < -220) {
            player.setFrame(0);
        } else {
            player.setFrame(1);
        }
    }
    else if (player.body.velocity.y >= -40 && player.body.velocity.y <= 40)
    {
        player.setFrame(2);
    }
    else
    {
        if (player.body.velocity.y < 220) {
            player.setFrame(3);
        } else {
            player.setFrame(4);
        }
    }
}

// Handles the player attack with left click
function PlayerAttack(scene)
{
    if (!player.active || playerDead) {
        return;
    }

    // Si está atacando, ignoramos el input.
    // No queremos sobre-ejecutar animaciones.
    if (isAttacking) {
        return;
    }

    // Si la ventana del combo está abierta,
    // marcamos que quiere el siguiente ataque.
    if (comboInputWindowOpen) {
        comboNextRequested = true;
        return;
    }

    // Si no está atacando y no hay ventana abierta,
    // empieza desde el ataque 1
    if (comboStep === 0) {
        StartComboAttack(scene, 1);
    }
}

function StartComboAttack(scene, attackNumber)
{
    if (!player.active || playerDead) {
        return;
    }

    isAttacking = true;
    canAttack = false;
    comboInputWindowOpen = false;
    comboNextRequested = false;

    if (comboResetTimer) {
        comboResetTimer.remove(false);
        comboResetTimer = null;
    }

    comboStep = attackNumber;

    player.setVelocityX(0);

    var currentAnimation = "";
    var activeTime = 120;

    if (comboStep === 1) {
        currentAnimation = "hero_attack1";
        activeTime = 120;
    }
    else if (comboStep === 2) {
        currentAnimation = "hero_attack2";
        activeTime = 120;
    }
    else if (comboStep === 3) {

    var isMoving = keys.left.isDown || keys.right.isDown;

    if (isMoving && player.body.blocked.down) {
        currentAnimation = "hero_attack3_run";
    } else {
        currentAnimation = "hero_attack3";
    }

    activeTime = 150;
    recoveryTime = 180;
}

    player.play(currentAnimation, true);

    attackHitbox.setVisible(true);
    attackHitbox.body.setEnable(true);

    scene.time.delayedCall(activeTime, function () {
        attackHitbox.setVisible(false);
        attackHitbox.body.setEnable(false);
    });
}

// Destroys enemy when attack hitbox touches it
function AttackEnemy(attackBox, enemy)
{
    if (!isAttacking || !enemy.active) {
        return;
    }

    enemy.disableBody(true, true);
}

// If player touches enemy without attacking, lose
function HitPlayer(playerObject, enemy)
{
    if (isAttacking || playerDead) {
        return;
    }

    playerDead = true;
    canAttack = false;
    isAttacking = false;
    comboStep = 0;
    attackQueued = false;

    if (comboResetTimer) {
        comboResetTimer.remove(false);
        comboResetTimer = null;
    }

    attackHitbox.setVisible(false);
    attackHitbox.body.setEnable(false);

    player.setVelocity(0, 0);
    player.body.enable = false;
    player.play("hero_death");

    this.time.delayedCall(900, function () {
        this.scene.start("EndGameScene", { result: "lose" });
    }, [], this);
}

// Win when player reaches the goal
function ReachGoal(playerObject, goalObject)
{
    if (playerWon) {
        return;
    }

    playerWon = true;
    this.scene.start("EndGameScene", { result: "win" });
}
