"use strict";
var HotlineLA;
(function (HotlineLA) {
    var fAid = FudgeAid;
    var f = FudgeCore;
    class BulletNode extends fAid.NodeSprite {
        constructor(gunNode) {
            super("bullet");
            let bulletMaterial = new f.Material("bulletMaterial", f.ShaderLit);
            //this.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 1));
            let componentMat = this.getComponent(f.ComponentMaterial);
            componentMat.material = bulletMaterial;
            componentMat.clrPrimary = f.Color.CSS("black");
            let componentTransf = new f.ComponentTransform();
            componentTransf.mtxLocal.translation = gunNode.mtxWorld.translation;
            componentTransf.mtxLocal.translateZ(-0.1);
            componentTransf.mtxLocal.rotation = gunNode.mtxWorld.rotation;
            componentTransf.mtxLocal.scale(new f.Vector3(0.2, 0.2, 1));
            this.addComponent(componentTransf);
            let componentRigidbody = new f.ComponentRigidbody();
            componentRigidbody.effectGravity = 0;
            componentRigidbody.mass = 0.1;
            // bullets can only rotate around the z axis
            componentRigidbody.effectRotation.x = 0;
            componentRigidbody.effectRotation.y = 0;
            //componentRigidbody.mtxPivot.scale(new f.Vector3(0.2,0.2,1));
            componentRigidbody.isTrigger = true;
            componentRigidbody.dampRotation = 4.5;
            componentRigidbody.collisionGroup = f.COLLISION_GROUP.GROUP_1;
            componentRigidbody.dampTranslation = 0;
            this.addComponent(componentRigidbody); //#endregion
            let script = new HotlineLA.BulletScript();
            this.addComponent(script);
        }
    }
    HotlineLA.BulletNode = BulletNode;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(HotlineLA); // Register the namespace to FUDGE for serialization
    class BulletScript extends f.ComponentScript {
        constructor() {
            super();
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        console.log("registered");
                        this.rgdBody = this.node.getComponent(f.ComponentRigidbody);
                        this.rgdBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, this.hndCollision);
                        this.init();
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            this.bulletDeath = () => {
                this.node.dispatchEvent(new Event("BulletHit", { bubbles: true }));
            };
            this.hndCollision = (event) => {
                console.log(event);
                console.log("boom");
                this.node.dispatchEvent(new Event("BulletHit", { bubbles: true }));
                if (event.cmpRigidbody.node.name.includes("Enemy")) {
                    this.node.dispatchEvent(new Event("CharacterHit", { bubbles: true }));
                }
            };
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        init() {
            let lifeSpan = new f.Timer(new f.Time, 3000, 1, this.bulletDeath);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    BulletScript.iSubclass = f.Component.registerSubclass(BulletScript);
    HotlineLA.BulletScript = BulletScript;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(HotlineLA); // Register the namespace to FUDGE for serialization
    class CharacterMovementScript extends f.ComponentScript {
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            this.PLAYER_SPEED = 200;
            this.BULLETSPEED = 20;
            this.shootAgain = true;
            this.bulletCount = 10;
            this.MAX_BULLETS = 10;
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        this.rgdBody = this.node.getComponent(f.ComponentRigidbody);
                        this.rgdBody.effectRotation.x = 0;
                        this.rgdBody.effectRotation.y = 0;
                        this.rgdBody.collisionMask = f.COLLISION_GROUP.GROUP_2;
                        this.torsoNode = this.node.getChild(0);
                        this.gunNode = this.torsoNode.getChild(0);
                        //this.rgdBody.addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, this.hndCollison);
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            this.hndBulletHit = (event) => {
                //  console.log("collided");
                //console.log(event);
            };
            this.moveY = (direction) => {
                this.rgdBody.applyForce(new f.Vector3(0, direction * this.PLAYER_SPEED, 0));
                //this.rgdBody.applyLinearImpulse(new f.Vector3( 0,direction * 12,0));
                //console.log("up " + this.playerSpeed);
            };
            this.moveX = (direction) => {
                this.rgdBody.applyForce(new f.Vector3(direction * this.PLAYER_SPEED, 0, 0));
            };
            this.rotateToMousePointer = (e) => {
                let mousePosY = e.clientY;
                let mousePosX = e.clientX;
                let windowCenterX = window.innerWidth / 2;
                let windowCenterY = window.innerHeight / 2;
                this.targetY = mousePosY - windowCenterY;
                this.targetX = mousePosX - windowCenterX;
                let angleRad = Math.atan2(this.targetY, this.targetX);
                let angleDeg = angleRad * (180.0 / Math.PI);
                this.torsoNode.mtxLocal.rotation = new f.Vector3(0, 0, -angleDeg);
            };
            this.shootBullet = () => {
                if (!this.shootAgain) {
                    return;
                }
                let bullet = new HotlineLA.BulletNode(this.gunNode);
                HotlineLA.branch.addChild(bullet);
                this.bulletCount++;
                // TODO: make the bullet precisely go from the initial position to the target point 
                bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse(f.Vector3.NORMALIZATION(new f.Vector3(this.targetX - this.gunNode.mtxWorld.translation.x, -(this.targetY - this.gunNode.mtxWorld.translation.y), 1), this.BULLETSPEED));
                //bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse( f.Vector3.NORMALIZATION( new f.Vector3(this.targetX ,-this.targetY,0),this.bulletSpeed));
                this.shootAgain = false;
                let time = new f.Time();
                let timer = new f.Timer(time, 150, 1, this.hndTime);
            };
            this.shootBulletsR = () => {
                if (!this.shootAgain || this.bulletCount <= 0) {
                    return;
                }
                //let bullet: f.Node = new BulletNode(this.gunNode)
                //branch.addChild(bullet);
                this.bulletCount--;
                // TODO: make the bullet precisely go from the initial position to the target point 
                // Cast a ray from the starting position of the bullet to the target position
                let startPos = this.gunNode.mtxWorld.translation;
                let endPos = new f.Vector3(this.targetX, -this.targetY, 0);
                let direction = f.Vector3.DIFFERENCE(endPos, startPos);
                let maxDistance = this.BULLETSPEED * 0.1; // Set the maximum distance of the raycast based on the bullet speed
                let raycast = f.Physics.raycast(startPos, direction, maxDistance);
                // If the ray intersects with an object, apply appropriate effects
                if (raycast.hit) {
                    // Apply damage or destruction to the object that was hit
                }
                this.shootAgain = false;
                let time = new f.Time();
                let timer = new f.Timer(time, 150, 1, this.hndTime);
            };
            this.reloadBullets = (bulletsToReload) => {
                this.bulletCount += bulletsToReload; // Increment bulletCount by the number of bullets being reloaded
            };
            this.hndTime = () => {
                this.shootAgain = true;
            };
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    CharacterMovementScript.iSubclass = f.Component.registerSubclass(CharacterMovementScript);
    HotlineLA.CharacterMovementScript = CharacterMovementScript;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(HotlineLA); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "CustomComponentScript added to ";
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Debug.log(this.message, this.node);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    CustomComponentScript.iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
    HotlineLA.CustomComponentScript = CustomComponentScript;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var fAid = FudgeAid;
    var f = FudgeCore;
    let AnimationState;
    (function (AnimationState) {
        AnimationState[AnimationState["WALK"] = 0] = "WALK";
        AnimationState[AnimationState["DEADSHOT"] = 1] = "DEADSHOT";
    })(AnimationState = HotlineLA.AnimationState || (HotlineLA.AnimationState = {}));
    class Enemy extends fAid.NodeSprite {
        constructor() {
            super("enemy");
            this.isShot = false;
            this.walkspeed = 2.6;
            this.attackSpeed = 3.5;
            this.viewRadius = 10;
            this.viewAngle = 120;
            this.isPlayerInFOV = () => {
                let playerDir = f.Vector3.DIFFERENCE(HotlineLA.avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
                playerDir.normalize();
                // Calculate the angle between the enemy's forward direction and the direction to the player
                let angleRad = f.Vector3.DOT(this.getParent().mtxWorld.getX(), playerDir);
                let angleDeg = Math.acos(angleRad) * (180.0 / Math.PI);
                let playerRange = this.mtxWorld.translation.getDistance(HotlineLA.avatarNode.mtxWorld.translation);
                // Check if the player is within the FOV of the enemy
                if (angleDeg < this.viewAngle / 2) {
                    console.log("target is in da house");
                    if (playerRange <= this.viewRadius) {
                        // Use a raycast to check if the player is behind a wall or not
                        let rCast = f.Physics.raycast(this.mtxWorld.translation, playerDir, 50, true);
                        if (rCast.hit) {
                            if (rCast.rigidbodyComponent.node.name == "avatar") {
                                console.log("direct view on target!");
                                return true;
                            }
                        }
                    }
                }
                return false;
            };
            this.update = () => {
                this.checkEndDeathAnimation();
            };
            this.addComponent(new f.ComponentTransform((new f.Matrix4x4())));
            this.rdgBody = new f.ComponentRigidbody();
            this.rdgBody.effectGravity = 0;
            this.rdgBody.mass = 0.1;
            this.rdgBody.typeBody = f.BODY_TYPE.KINEMATIC;
            this.rdgBody.effectRotation.x = 0;
            this.rdgBody.effectRotation.y = 0;
            this.addComponent(this.rdgBody);
            this.rdgBody.collisionGroup = f.COLLISION_GROUP.GROUP_1;
        }
        initializeAnimations(sheetWalk, sheetShotDeath, sheetShotDeathFront) {
            let coatWalk = new f.CoatTextured(undefined, sheetWalk);
            this.animWalk = new fAid.SpriteSheetAnimation("Walk", coatWalk);
            this.animWalk.generateByGrid(f.Rectangle.GET(4, 0, 25, 30), 9, 11, f.ORIGIN2D.CENTER, f.Vector2.X(33));
            let coatDeathShot = new f.CoatTextured(undefined, sheetShotDeath);
            this.animShotDeath = new fAid.SpriteSheetAnimation("Walk", coatDeathShot);
            this.animShotDeath.generateByGrid(f.Rectangle.GET(2, 0, 60, 30), 5, 11, f.ORIGIN2D.CENTERLEFT, f.Vector2.X(60));
            let coatDeathShotFront = new f.CoatTextured(undefined, sheetShotDeathFront);
            this.animShotDeathFront = new fAid.SpriteSheetAnimation("Walk", coatDeathShotFront);
            this.animShotDeathFront.generateByGrid(f.Rectangle.GET(6, 0, 72, 35), 5, 11, f.ORIGIN2D.CENTERLEFT, f.Vector2.X(72));
            this.mtxLocal.translateZ(-0.1);
            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 10;
            let statemachine = new HotlineLA.enemyStateMachine();
            this.addComponent(statemachine);
        }
        chasePlayer() {
            let playerDir = f.Vector3.DIFFERENCE(HotlineLA.avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            playerDir.normalize();
            let rCast = f.Physics.raycast(this.mtxWorld.translation, playerDir, 50, true);
            let posNode = this.getParent();
            posNode.mtxLocal.rotation = new f.Vector3(0, 0, this.getPlayerAngle());
            // Move the enemy towards the player's position
            posNode.mtxLocal.translateX(this.attackSpeed * f.Loop.timeFrameGame / 1000);
        }
        getPlayerAngle() {
            let playerDir = f.Vector3.DIFFERENCE(HotlineLA.avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            // Calculate the angle between the enemy's forward direction and the direction to the player
            let angleRad = Math.atan2(playerDir.y, playerDir.x);
            return angleRad * (180.0 / Math.PI);
        }
        patroll(deltaTime) {
            let posNode = this.getParent();
            let rcast1 = f.Physics.raycast(posNode.mtxWorld.translation, posNode.mtxWorld.getX(), 1.5, true, f.COLLISION_GROUP.GROUP_2);
            if (rcast1.hit) {
                console.log("WAAAAALLL");
                posNode.mtxLocal.rotateZ(-90);
            }
            else {
                if (deltaTime) {
                    posNode.mtxLocal.translateX(this.walkspeed * deltaTime);
                }
            }
        }
        addBlood(direction) {
            let bloodNode = new f.Node("blood");
            let spriteMaterial = new f.Material("bloodmaterial", f.ShaderLitTextured);
            let coatBlood = new f.CoatTextured(undefined, HotlineLA.bloodSprite);
            spriteMaterial.coat = coatBlood;
            let compMat = new f.ComponentMaterial(spriteMaterial);
            let cmpMesh = new f.ComponentMesh(new f.MeshQuad);
            let cmpTransf = new f.ComponentTransform();
            console.log("translation of blood: " + f.Vector3.SCALE(direction, 1));
            cmpTransf.mtxLocal.translate(f.Vector3.NORMALIZATION(direction, 4));
            cmpTransf.mtxLocal.scale(new f.Vector3(3, 3, 1));
            bloodNode.addComponent(compMat);
            bloodNode.addComponent(cmpMesh);
            bloodNode.addComponent(cmpTransf);
            this.addChild(bloodNode);
        }
        setHeadShotAnimation(collisionDirection) {
            let angleRad = Math.atan2(collisionDirection.y, -collisionDirection.x);
            let angleDeg = angleRad * (180.0 / Math.PI);
            let direction = new f.Vector3(0, 0, angleDeg);
            console.log(collisionDirection);
            let onBack = true;
            // falls enemy durch eine wand durchfallen würde, lass ihn nach "vorne" fallen
            let rcast1 = f.Physics.raycast(this.mtxWorld.translation, collisionDirection, 5, true, f.COLLISION_GROUP.GROUP_2);
            if (rcast1.hit) {
                console.log(rcast1.rigidbodyComponent.node.name);
                direction = new f.Vector3(0, 0, -angleDeg);
                onBack = false;
                console.log("i hitta wall!!");
            }
            this.getParent().mtxLocal.rotation = direction;
            this.setFallinganimation(onBack);
            let directionVecto = new f.Vector3(1, 0, 0);
            f.Vector3.TRANSFORMATION(directionVecto, f.Matrix4x4.ROTATION(new f.Vector3(0, 0, angleDeg)));
            this.addBlood(directionVecto);
        }
        setFallinganimation(onBack) {
            if (onBack) {
                this.setAnimation(this.animShotDeath);
                this.framerate = 10;
            }
            else {
                this.setAnimation(this.animShotDeathFront);
                this.framerate = 5;
            }
            this.animState = AnimationState.DEADSHOT;
        }
        checkEndDeathAnimation() {
            if (this.animState == AnimationState.DEADSHOT) {
                this.removeComponent(this.rdgBody);
                if (this.getCurrentFrame == 3) {
                    this.setFrameDirection(0);
                }
            }
        }
    }
    HotlineLA.Enemy = Enemy;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let avatarCmp;
    let enemys;
    let enemyPos;
    let walls;
    let cmpCamera;
    function start(_event) {
        viewport = _event.detail;
        HotlineLA.branch = viewport.getBranch();
        HotlineLA.avatarNode = HotlineLA.branch.getChildrenByName("avatar")[0];
        avatarCmp = HotlineLA.avatarNode.getComponent(HotlineLA.CharacterMovementScript);
        cmpCamera = viewport.camera;
        let wallParent = HotlineLA.branch.getChildrenByName("Walls")[0];
        walls = wallParent.getChildren();
        for (let wall of walls) {
            //collisiongroup2 is for walls // for raycasts
            wall.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_2;
        }
        loadEnemys();
        cmpCamera.mtxPivot.rotateY(180);
        cmpCamera.mtxPivot.translation = new f.Vector3(0, 0, 35);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        HotlineLA.branch.addEventListener("BulletHit", hndBulletHit);
        document.addEventListener("mousedown", hndClick);
        document.addEventListener("mousemove", avatarCmp.rotateToMousePointer);
        f.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    async function loadEnemys() {
        enemys = HotlineLA.branch.getChildrenByName("Enemys");
        enemyPos = enemys[0].getChildrenByName("EnemyPos")[0];
        enemyPos.removeComponent(enemyPos.getComponent(f.ComponentMesh));
        let enemyNode = new HotlineLA.Enemy();
        let imgSpriteSheetWalk = new f.TextureImage();
        await imgSpriteSheetWalk.load("./Images/EnemySprites/EnemyArmed.png");
        let imgSpriteSheehtShotDead = new f.TextureImage();
        await imgSpriteSheehtShotDead.load("./Images/EnemySprites/EnemyDeath1.png");
        let imgSpriteSheehtShotDeadF = new f.TextureImage();
        await imgSpriteSheehtShotDeadF.load("./Images/EnemySprites/EnemyDeadFront.png");
        HotlineLA.bloodSprite = new f.TextureImage();
        await HotlineLA.bloodSprite.load("./Images/EnemySprites/BloodPuddle.png");
        enemyNode.initializeAnimations(imgSpriteSheetWalk, imgSpriteSheehtShotDead, imgSpriteSheehtShotDeadF);
        enemyPos.appendChild(enemyNode);
    }
    let bulletToRemove;
    function hndBulletHit(event) {
        //  console.log("collided");
        bulletToRemove = event.target;
        //console.log(bulletToRemove.name);
        //bulletToRemove.removeComponent(bulletToRemove.getComponent(BulletScript));
        setTimeout(removeBullet, 1);
    }
    function removeBullet() {
        HotlineLA.branch.removeChild(bulletToRemove);
    }
    function updateCamera() {
        cmpCamera.mtxPivot.translation = new f.Vector3(HotlineLA.avatarNode.mtxLocal.translation.x, HotlineLA.avatarNode.mtxLocal.translation.y, cmpCamera.mtxPivot.translation.z);
    }
    function hndClick(event) {
        avatarCmp.shootBullet();
    }
    function update(_event) {
        f.Physics.settings.solverIterations = 5000;
        f.Physics.simulate(); // if physics is included and used
        viewport.draw();
        f.AudioManager.default.update();
        //f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        viewport.physicsDebugMode = 2;
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.B])) {
            avatarCmp.shootBullet();
        }
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.W, f.KEYBOARD_CODE.ARROW_UP])) {
            avatarCmp.moveY(1);
        }
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.S, f.KEYBOARD_CODE.ARROW_DOWN])) {
            avatarCmp.moveY(-1);
        }
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT])) {
            avatarCmp.moveX(1);
        }
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT])) {
            avatarCmp.moveX(-1);
        }
        updateCamera();
    }
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var f = FudgeCore;
    var ƒAid = FudgeAid;
    f.Project.registerScriptNamespace(HotlineLA); // Register the namespace to FUDGE for serialization
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["PATROLL"] = 1] = "PATROLL";
        JOB[JOB["ATTACK"] = 2] = "ATTACK";
        JOB[JOB["DEAD"] = 3] = "DEAD";
    })(JOB || (JOB = {}));
    class enemyStateMachine extends ƒAid.ComponentStateMachine {
        constructor() {
            super();
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        this.enemyN = this.node;
                        this.enemyN.getComponent(f.ComponentRigidbody).addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, this.hndShot);
                        this.transit(JOB.PATROLL);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        f.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        break;
                }
            };
            this.hndShot = (_event) => {
                console.log("im shot for real");
                if (_event.cmpRigidbody.node.name == "bullet") {
                    this.enemyN.setHeadShotAnimation(_event.collisionNormal);
                    this.transit(JOB.DEAD);
                    this.enemyN.rdgBody.removeEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, this.hndShot);
                }
            };
            this.update = (_event) => {
                this.act();
                this.deltaTime = f.Loop.timeFrameGame / 1000;
            };
            this.instructions = enemyStateMachine.instructions; // setup instructions with the static set
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = enemyStateMachine.transitDefault;
            setup.actDefault = enemyStateMachine.actDefault;
            setup.setAction(JOB.IDLE, this.actIdle);
            setup.setAction(JOB.PATROLL, this.actPatroll);
            setup.setAction(JOB.ATTACK, this.actAttack);
            setup.setAction(JOB.DEAD, this.actDead);
            return setup;
        }
        static transitDefault(_machine) {
            console.log("Transit to", _machine.stateNext);
        }
        static async actDefault(_machine) {
            console.log("Default");
            if (_machine.enemyN.isPlayerInFOV()) {
                _machine.transit(JOB.ATTACK);
            }
        }
        static async actPatroll(_machine) {
            console.log("Patrolling");
            if (_machine.enemyN.isPlayerInFOV()) {
                _machine.transit(JOB.ATTACK);
            }
            _machine.enemyN.patroll(_machine.deltaTime);
        }
        static async actAttack(_machine) {
            if (_machine.enemyN.isPlayerInFOV()) {
                _machine.enemyN.chasePlayer();
            }
            else {
                _machine.transit(JOB.IDLE);
            }
            console.log("Attack");
        }
        static async actDead(_machine) {
            _machine.enemyN.checkEndDeathAnimation();
            console.log("im Dead");
        }
        static async actIdle(_machine) {
            // if(distance.magnitude <10){
            //
            //  _machine.transit(JOB.ATTACK);
            //} 
            enemyStateMachine.actDefault(_machine);
        }
    }
    enemyStateMachine.iSubclass = f.Component.registerSubclass(enemyStateMachine);
    enemyStateMachine.instructions = enemyStateMachine.get();
    HotlineLA.enemyStateMachine = enemyStateMachine;
})(HotlineLA || (HotlineLA = {}));
//# sourceMappingURL=Script.js.map