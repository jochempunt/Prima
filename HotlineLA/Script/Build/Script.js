"use strict";
var HotlineLA;
(function (HotlineLA) {
    var fAid = FudgeAid;
    var f = FudgeCore;
    class Ammo extends fAid.NodeSprite {
        constructor(position) {
            super("ammo");
            let componentTransf = new f.ComponentTransform();
            componentTransf.mtxLocal.translation = position;
            componentTransf.mtxLocal.translateZ(0.1);
            componentTransf.mtxLocal.scaling = new f.Vector3(1.5, 1.5, 1);
            this.addComponent(componentTransf);
            let ammoMaterial = new f.Material("ammoMaterial", f.ShaderLitTextured);
            let coatAmmo = new f.CoatTextured(undefined, HotlineLA.AmmoImage);
            ammoMaterial.coat = coatAmmo;
            //this.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 1));
            let componentMat = this.getComponent(f.ComponentMaterial);
            componentMat.material = ammoMaterial;
            let ComponentRigidbody = new f.ComponentRigidbody();
            ComponentRigidbody.isTrigger = true;
            ComponentRigidbody.effectGravity = 0;
            ComponentRigidbody.collisionGroup = f.COLLISION_GROUP.GROUP_2;
            this.addComponent(ComponentRigidbody);
        }
    }
    HotlineLA.Ammo = Ammo;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var fAid = FudgeAid;
    var f = FudgeCore;
    class BulletNode extends fAid.NodeSprite {
        constructor(gunNode, rayHit) {
            super("bullet");
            this.bulletSpeed = 37;
            this.moveBullet = () => {
                // Calculate the direction the bullet should travel
                let distanceTravelled = this.startPos.getDistance(this.mtxWorld.translation);
                if (distanceTravelled >= this.endPos.getDistance(this.startPos) - 0.5) {
                    this.getParent().removeChild(this);
                    f.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.moveBullet);
                    return;
                }
                // Update the position of the bullet
                this.mtxLocal.translateX(this.bulletSpeed * (f.Loop.timeFrameGame / 1000));
            };
            let bulletMaterial = new f.Material("bulletMaterial", f.ShaderLitTextured);
            let coatBullet = new f.CoatTextured(undefined, HotlineLA.BulletImage);
            bulletMaterial.coat = coatBullet;
            //this.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 1));
            let componentMat = this.getComponent(f.ComponentMaterial);
            componentMat.material = bulletMaterial;
            //componentMat.clrPrimary = f.Color.CSS("black");
            let componentTransf = new f.ComponentTransform();
            componentTransf.mtxLocal.translation = gunNode.mtxWorld.translation;
            componentTransf.mtxLocal.translateZ(-0.1);
            componentTransf.mtxLocal.rotation = gunNode.mtxWorld.rotation;
            componentTransf.mtxLocal.scale(new f.Vector3(1.5, 1.5, 1.5));
            this.addComponent(componentTransf);
            this.startPos = gunNode.mtxWorld.translation;
            this.endPos = rayHit.hitPoint;
            f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.moveBullet);
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
                        this.rgdBody.removeEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, this.hndCollision);
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
            new f.Timer(new f.Time, 3000, 1, this.bulletDeath);
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
        constructor() {
            super();
            this.PLAYER_SPEED = 200;
            this.BULLETSPEED = 20;
            this.shootAgain = true;
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
                        this.setup();
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            this.setup = () => {
                this.initialtransform = this.node.mtxLocal.clone;
                this.rgdBody = this.node.getComponent(f.ComponentRigidbody);
                this.rgdBody.effectRotation.x = 0;
                this.rgdBody.effectRotation.y = 0;
                this.rgdBody.collisionGroup = f.COLLISION_GROUP.GROUP_1;
                this.rgdBody.collisionMask = f.COLLISION_GROUP.GROUP_2;
                this.torsoNode = this.node.getChild(0);
                this.gunNode = this.torsoNode.getChild(0);
                this.bulletCount = 10;
                this.avatarSprites = new HotlineLA.avatar();
                this.torsoNode.removeComponent(this.torsoNode.getComponent(f.ComponentMaterial));
                this.torsoNode.addChild(this.avatarSprites);
                this.dead = false;
                this.cmpListener = new ƒ.ComponentAudioListener();
                this.node.addComponent(this.cmpListener);
                ƒ.AudioManager.default.listenWith(this.cmpListener);
                this.cmpAudio = new ƒ.ComponentAudio(HotlineLA.audioShot);
                this.cmpAudio.volume = 0.25;
                this.node.addComponent(this.cmpAudio);
                if (HotlineLA.gameState) {
                    HotlineLA.gameState.bulletCount = this.bulletCount;
                }
            };
            this.moveY = (direction) => {
                this.rgdBody.applyForce(new f.Vector3(0, direction * this.PLAYER_SPEED, 0));
            };
            this.moveX = (direction) => {
                this.rgdBody.applyForce(new f.Vector3(direction * this.PLAYER_SPEED, 0, 0));
            };
            this.rotateToMousePointer = (e) => {
                if (!this.dead) {
                    let mousePosY = e.clientY;
                    let mousePosX = e.clientX;
                    let windowCenterX = window.innerWidth / 2;
                    let windowCenterY = window.innerHeight / 2;
                    this.targetY = mousePosY - windowCenterY;
                    this.targetX = mousePosX - windowCenterX;
                    let angleRad = Math.atan2(this.targetY, this.targetX);
                    let angleDeg = angleRad * (180.0 / Math.PI);
                    this.torsoNode.mtxLocal.rotation = new f.Vector3(0, 0, -angleDeg);
                }
            };
            this.shootBulletsR = () => {
                if (!this.shootAgain || this.bulletCount <= 0 || this.dead) {
                    return;
                }
                this.bulletCount--;
                // Cast a ray from the starting position of the bullet to the target position
                let startPos = this.gunNode.mtxWorld.translation;
                let endPos = new f.Vector3(this.targetX, -this.targetY, 0);
                let direction = f.Vector3.DIFFERENCE(endPos, startPos);
                let maxDistance = this.BULLETSPEED * 0.1; // Set the maximum distance of the raycast based on the bullet speed
                let raycast = f.Physics.raycast(startPos, direction, maxDistance);
                if (raycast.hit) {
                    this.avatarSprites.shootAnim();
                    HotlineLA.branch.addChild(new HotlineLA.BulletNode(this.gunNode, raycast));
                    HotlineLA.avatarCmp.cmpAudio.setAudio(HotlineLA.audioShot);
                    HotlineLA.avatarCmp.cmpAudio.play(true);
                    this.cmpAudio.play(true);
                    if (raycast.rigidbodyComponent.node.name.includes("enemy")) {
                        console.log("hit enemy");
                        let enemy = raycast.rigidbodyComponent.node;
                        enemy.getComponent(HotlineLA.enemyStateMachine).hndShotDead(raycast.hitNormal);
                    }
                }
                this.shootAgain = false;
                let time = new f.Time();
                new f.Timer(time, 150, 1, this.enableShooting);
            };
            this.reloadBullets = (bulletsToReload) => {
                this.bulletCount += bulletsToReload; // Increment bulletCount by the number of bullets being reloaded
            };
            this.enableShooting = () => {
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
        initialiseAnimations(shootingImg, deathImg) {
            this.avatarSprites.initaliseAnimations(shootingImg, deathImg);
        }
        die() {
            this.avatarSprites.mtxLocal.translateZ(-0.1);
            this.avatarSprites.setDeathSprite();
            this.rgdBody.activate(false);
            this.dead = true;
        }
        reset() {
            this.node.mtxLocal.set(this.initialtransform);
            this.rgdBody.setVelocity(f.Vector3.ZERO());
            this.rgdBody.activate(true);
            this.bulletCount = this.MAX_BULLETS;
            this.shootAgain = true;
            this.dead = false;
            this.avatarSprites.reset();
            if (HotlineLA.gameState) {
                HotlineLA.gameState.bulletCount = this.bulletCount;
            }
            // protected reduceMutator(_mutator: ƒ.Mutator): void {
            //   // delete properties that should not be mutated
            //   // undefined properties and private fields (#) will not be included by default
            // }
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
        constructor(_gun, _armed = true) {
            super("enemy");
            this.isDead = false;
            this.walkspeed = 3;
            this.attackSpeed = 3.5;
            this.viewRadius = 50;
            this.viewAngle = 120;
            this.shootAgain = true;
            this.reloadTime = 2000;
            this.isPlayerInFOV = () => {
                let playerDir = f.Vector3.DIFFERENCE(HotlineLA.avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
                playerDir.normalize();
                // Calculate the angle between the enemy's forward direction and the direction to the player
                let angleRad = f.Vector3.DOT(this.getParent().mtxWorld.getX(), playerDir);
                let angleDeg = Math.acos(angleRad) * (180.0 / Math.PI);
                let playerRange = this.mtxWorld.translation.getDistance(HotlineLA.avatarNode.mtxWorld.translation);
                // Check if the player is within the FOV of the enemy
                if (angleDeg < this.viewAngle / 2) {
                    if (playerRange <= this.viewRadius) {
                        // Use a raycast to check if the player is behind a wall or not
                        let rCast = f.Physics.raycast(this.mtxWorld.translation, playerDir, 50, true);
                        if (rCast.hit) {
                            if (rCast.rigidbodyComponent.node.name == "avatar") {
                                return true;
                            }
                        }
                    }
                }
                return false;
            };
            this.playerHitEvent = () => {
                this.dispatchEvent(new Event("PlayerHit", { bubbles: true }));
            };
            this.shootBulletsR = () => {
                if (!this.shootAgain) {
                    return;
                }
                // get the endpoint of the direction the enemy is looking at
                let coordinates = this.getCoordinatesFromAngle(this.mtxWorld.rotation.z);
                // Cast a ray from the starting position of the bullet to the target position
                let startPos = this.gunNode.mtxWorld.translation;
                let endPos = new f.Vector3(coordinates.x, coordinates.y, 0);
                let posNode = this.getParent();
                //let ray1: f.RayHitInfo = f.Physics.raycast(this.gunNode.mtxWorld.translation,playerDir,20,true);
                let ray1 = f.Physics.raycast(this.gunNode.mtxWorld.translation, endPos, 20, true);
                if (ray1.hit) {
                    this.audioComp.setAudio(HotlineLA.audioShot);
                    this.audioComp.play(true);
                    HotlineLA.branch.addChild(new HotlineLA.BulletNode(this.gunNode, ray1));
                    if (ray1.rigidbodyComponent.node.name.includes("avatar")) {
                        console.log("hit Avatar");
                        new f.Timer(new f.Time, 100, 1, this.playerHitEvent);
                        this.shootAgain = false;
                        new f.Timer(new f.Time(), this.reloadTime, 1, this.enableShooting);
                        //this.dispatchEvent(new Event("PlayerHit", { bubbles: true }));
                        return;
                    }
                }
                this.shootAgain = false;
                new f.Timer(new f.Time(), this.reloadTime, 1, this.enableShooting);
            };
            this.enableShooting = () => {
                this.shootAgain = true;
            };
            this.dropAmmo = () => {
                let ammo1 = new HotlineLA.Ammo(this.mtxWorld.translation);
                HotlineLA.itemBranch.addChild(ammo1);
            };
            this.addComponent(new f.ComponentTransform((new f.Matrix4x4())));
            this.rdgBody = new f.ComponentRigidbody();
            this.rdgBody.effectGravity = 0;
            this.rdgBody.mass = 0.1;
            this.rdgBody.typeBody = f.BODY_TYPE.KINEMATIC;
            this.rdgBody.effectRotation.x = 0;
            this.rdgBody.effectRotation.y = 0;
            this.isArmed = _armed;
            this.addComponent(this.rdgBody);
            this.rdgBody.collisionGroup = f.COLLISION_GROUP.GROUP_2;
            this.gunNode = _gun;
            this.audioComp = new f.ComponentAudio();
            this.addComponent(this.audioComp);
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
            //this.mtxLocal.translation =new f.Vector3(this.mtxLocal.translation.x,this.mtxLocal.translation.y,-0.1) ;
            //this.mtxLocal.scale(new f.Vector3(1,1,1));
            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 10;
            this.statemachine = new HotlineLA.enemyStateMachine();
            this.addComponent(this.statemachine);
        }
        chasePlayer() {
            this.showFrame(0);
            let playerDir = f.Vector3.DIFFERENCE(HotlineLA.avatarNode.mtxWorld.translation, this.gunNode.mtxWorld.translation);
            playerDir.normalize();
            let posNode = this.getParent();
            let coordinates = this.getCoordinatesFromAngle(this.mtxWorld.rotation.z);
            let endP = new f.Vector3(coordinates.x, coordinates.y, 0);
            let ray1 = f.Physics.raycast(this.gunNode.mtxWorld.translation, endP, 20, true);
            posNode.mtxLocal.rotation = new f.Vector3(0, 0, this.getPlayerAngle() + 5);
            if (ray1.rigidbodyComponent.node.name.includes("Wall")) {
                this.statemachine.transit(HotlineLA.JOB.PATROLL);
                return;
            }
            if (this.mtxWorld.translation.getDistance(HotlineLA.avatarNode.mtxWorld.translation) <= 10) {
                this.shootBulletsR();
                return;
            }
            // Move the enemy towards the player's position
            posNode.mtxLocal.translateX(this.attackSpeed * f.Loop.timeFrameGame / 1000);
            if (this.mtxWorld.translation.getDistance(HotlineLA.avatarNode.mtxWorld.translation) <= 1.2) {
                this.dispatchEvent(new Event("PlayerHit", { bubbles: true }));
            }
        }
        getPlayerAngle() {
            let playerDir = f.Vector3.DIFFERENCE(HotlineLA.avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            // Calculate the angle between the enemy's forward direction and the direction to the player
            let angleRad = Math.atan2(playerDir.y, playerDir.x);
            return angleRad * (180.0 / Math.PI);
        }
        patroll(deltaTime) {
            let posNode = this.getParent();
            let rcast1 = f.Physics.raycast(posNode.mtxWorld.translation, posNode.mtxWorld.getX(), 1.5, true);
            if (rcast1.hit) {
                if (rcast1.rigidbodyComponent.typeBody == f.BODY_TYPE.STATIC) {
                    posNode.mtxLocal.rotateZ(-90);
                }
            }
            else {
                if (deltaTime) {
                    posNode.mtxLocal.translateX(this.walkspeed * deltaTime);
                }
            }
        }
        addBlood(direction) {
            this.dispatchEvent(new Event("shotEnemy", { bubbles: true }));
            let bloodNode = new f.Node("blood");
            let spriteMaterial = new f.Material("bloodmaterial", f.ShaderLitTextured);
            let coatBlood = new f.CoatTextured(undefined, HotlineLA.bloodSprite);
            spriteMaterial.coat = coatBlood;
            let compMat = new f.ComponentMaterial(spriteMaterial);
            let cmpMesh = new f.ComponentMesh(new f.MeshQuad);
            let cmpTransf = new f.ComponentTransform();
            cmpTransf.mtxLocal.translate(f.Vector3.NORMALIZATION(direction, 4));
            cmpTransf.mtxLocal.scale(new f.Vector3(3, 3, 1));
            bloodNode.addComponent(compMat);
            bloodNode.addComponent(cmpMesh);
            bloodNode.addComponent(cmpTransf);
            this.addChild(bloodNode);
        }
        getCoordinatesFromAngle(angle) {
            const radians = angle * (Math.PI / 180);
            return {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };
        }
        handleHeadshotCollision(collisionDirection) {
            let angleRad = Math.atan2(-collisionDirection.y, -collisionDirection.x);
            let angleDeg = angleRad * (180.0 / Math.PI);
            let direction = new f.Vector3(0, 0, angleDeg);
            let onBack = true;
            // falls enemy durch eine wand durchfallen würde, lass ihn nach "vorne" fallen
            let rcast1 = f.Physics.raycast(this.mtxWorld.translation, new f.Vector3(-collisionDirection.x, -collisionDirection.y, 0), 7, true);
            if (rcast1.hit) {
                if (rcast1.rigidbodyComponent.node.name.includes("Wall")) {
                    direction = new f.Vector3(0, 0, angleDeg + 180);
                    onBack = false;
                }
            }
            //TODO do this after the bullet has hit, not before
            this.mtxLocal.rotation = direction;
            new f.Timer(new f.Time, 135, 1, this.setFallinganimation.bind(this, onBack));
            let directionVecto = new f.Vector3(1, 0, 0);
            f.Vector3.TRANSFORMATION(directionVecto, f.Matrix4x4.ROTATION(new f.Vector3(0, 0, angleDeg)));
            new f.Timer(new f.Time, 300, 1, this.addBlood.bind(this, directionVecto));
            if (this.isArmed) {
                new f.Timer(new f.Time, 800, 1, this.dropAmmo);
            }
            this.mtxLocal.translateZ(-0.3);
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
        // remove the rigidbody instantly after death, and stop the animation when it came to the last frame
        cleanUpAfterDeath() {
            if (this.animState == AnimationState.DEADSHOT) {
                this.removeComponent(this.rdgBody);
                this.isDead = true;
                if (this.getCurrentFrame == 3) {
                    this.setFrameDirection(0);
                }
            }
        }
        reset() {
            // Reset the enemy's properties to their initial state
            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 10;
            this.mtxLocal.rotation = f.Vector3.ZERO();
            this.mtxLocal.translation = new f.Vector3(0, 0, 0);
            this.statemachine.resetState();
            // Remove the blood node if it exists
            if (this.isDead) {
                this.removeAllChildren();
                this.bloodNode = undefined;
                this.addComponent(this.rdgBody);
                this.isDead = false;
            }
        }
    }
    HotlineLA.Enemy = Enemy;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var f = FudgeCore;
    var fui = FudgeUserInterface;
    class GameState extends f.Mutable {
        constructor() {
            super();
            this.controller = new fui.Controller(this, document.getElementById("vui"));
            console.log(this.controller);
            console.log("mutator");
            console.log(this.getMutator());
        }
        reduceMutator(_mutator) { }
    }
    HotlineLA.GameState = GameState;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let enemyBranch;
    let enemys = [];
    let enemyPositionNodes;
    let intialenemyTransforms = [];
    let walls;
    let cmpCamera;
    let lastTimeKill;
    function start(_event) {
        HotlineLA.gameState = new HotlineLA.GameState();
        viewport = _event.detail;
        HotlineLA.branch = viewport.getBranch();
        HotlineLA.avatarNode = HotlineLA.branch.getChildrenByName("avatar")[0];
        HotlineLA.avatarCmp = HotlineLA.avatarNode.getComponent(HotlineLA.CharacterMovementScript);
        HotlineLA.itemBranch = HotlineLA.branch.getChildrenByName("items")[0];
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
        document.addEventListener("mousedown", hndClick);
        document.addEventListener("mousemove", HotlineLA.avatarCmp.rotateToMousePointer);
        HotlineLA.branch.addEventListener("PlayerHit", killPlayer);
        HotlineLA.branch.addEventListener("shotEnemy", hndEnemyKilled);
        let rigid = HotlineLA.avatarNode.getComponent(f.ComponentRigidbody);
        rigid.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, pickupItem);
        f.Loop.start();
        // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    let activePoints = [];
    function hndEnemyKilled(event) {
        let enemy = event.target;
        let enemyPos = enemy.mtxWorld.translation;
        console.log(enemyPos);
        let points = 400;
        let newPos = viewport.pointWorldToClient(enemyPos);
        console.log("x: " + newPos.x + "px y: " + newPos.y + "px");
        let pointText = document.createElement("div");
        let now = Date.now();
        if (lastTimeKill) {
            let elapsedTimeInSeconds = (now - lastTimeKill) / 1000;
            if (elapsedTimeInSeconds <= 3) {
                HotlineLA.gameState.multiplier++;
            }
        }
        lastTimeKill = now;
        pointText.textContent = points * HotlineLA.gameState.multiplier + "";
        pointText.className = "pointPop";
        pointText.style.position = "absolute";
        pointText.style.left = newPos.x + "px";
        pointText.style.top = newPos.y - 40 + "px";
        // Add text element to DOM
        document.body.appendChild(pointText);
        let p = new HotlineLA.Point(enemyPos, pointText);
        activePoints.push(p);
        new f.Timer(new f.Time, 1000, 1, deleteLastPoint.bind(this, p));
        HotlineLA.gameState.points = HotlineLA.gameState.points + (points * HotlineLA.gameState.multiplier);
    }
    function updateMultiplier() {
        let now = Date.now();
        if (lastTimeKill) {
            let elapsedTimeInSeconds = (now - lastTimeKill) / 1000;
            if (elapsedTimeInSeconds > 3) {
                HotlineLA.gameState.multiplier = 1;
            }
        }
    }
    function deleteLastPoint(point) {
        activePoints.slice(activePoints.indexOf(point), 1);
        document.body.removeChild(point.divElement);
    }
    function updatePointPositions() {
        for (let p of activePoints) {
            if (p) {
                let newPos = viewport.pointWorldToClient(p.gameCoordinates);
                p.divElement.style.left = newPos.x + "px";
                p.divElement.style.top = newPos.y - 40 + "px";
            }
        }
    }
    function pickupItem(event) {
        if (event.cmpRigidbody.node.name == "ammo") {
            HotlineLA.avatarCmp.cmpAudio.setAudio(HotlineLA.audioRefill);
            HotlineLA.avatarCmp.cmpAudio.play(true);
            HotlineLA.avatarCmp.reloadBullets(1);
            let node = event.cmpRigidbody.node;
            setTimeout(removeItem.bind(this, node), 1);
        }
    }
    function removeItem(node) {
        HotlineLA.itemBranch.removeChild(node);
    }
    function killPlayer() {
        HotlineLA.avatarCmp.die();
        setTimeout(ResetLevel, 1000);
    }
    async function loadEnemys() {
        let imgSpriteSheetWalk = new f.TextureImage();
        await imgSpriteSheetWalk.load("./Images/EnemySprites/EnemyArmed.png");
        let imgSpriteSheehtShotDead = new f.TextureImage();
        await imgSpriteSheehtShotDead.load("./Images/EnemySprites/EnemyDeath1.png");
        let imgSpriteSheehtShotDeadF = new f.TextureImage();
        await imgSpriteSheehtShotDeadF.load("./Images/EnemySprites/EnemyDeadFront.png");
        HotlineLA.bloodSprite = new f.TextureImage();
        await HotlineLA.bloodSprite.load("./Images/EnemySprites/BloodPuddle.png");
        HotlineLA.BulletImage = new f.TextureImage();
        await HotlineLA.BulletImage.load("./Images/FX/CharacterBullet.png");
        HotlineLA.AmmoImage = new f.TextureImage();
        await HotlineLA.AmmoImage.load("./Images/avatarSprites/ammo.png");
        let avatarShootSprite = new f.TextureImage();
        await avatarShootSprite.load("./Images/avatarSprites/shootAnimation.png");
        let avatarDeathShotSprite = new f.TextureImage();
        await avatarDeathShotSprite.load("./Images/avatarSprites/deathShotA.png");
        HotlineLA.avatarCmp.initialiseAnimations(avatarShootSprite, avatarDeathShotSprite);
        HotlineLA.gameState.bulletCount = HotlineLA.avatarCmp.bulletCount;
        HotlineLA.gameState.points = 0;
        HotlineLA.gameState.multiplier = 1;
        showVui();
        enemyBranch = HotlineLA.branch.getChildrenByName("Enemys");
        enemyPositionNodes = enemyBranch[0].getChildrenByName("EnemyPos");
        for (let enemyP of enemyPositionNodes) {
            intialenemyTransforms.push(enemyP.mtxLocal.clone);
            enemyP.removeComponent(enemyP.getComponent(f.ComponentMesh));
            let gun = enemyP.getChildrenByName("Gun")[0];
            let enemyNode = new HotlineLA.Enemy(gun);
            enemyNode.initializeAnimations(imgSpriteSheetWalk, imgSpriteSheehtShotDead, imgSpriteSheehtShotDeadF);
            enemys.push(enemyNode);
            enemyP.appendChild(enemyNode);
        }
        HotlineLA.audioShot = new f.Audio();
        await HotlineLA.audioShot.load("./Sounds/9mmshot.mp3");
        HotlineLA.audioRefill = new f.Audio();
        await HotlineLA.audioRefill.load("./Sounds/ammoRefill.mp3");
    }
    function updateCamera() {
        cmpCamera.mtxPivot.translation = new f.Vector3(HotlineLA.avatarNode.mtxLocal.translation.x, HotlineLA.avatarNode.mtxLocal.translation.y, cmpCamera.mtxPivot.translation.z);
    }
    function hndClick(event) {
        //avatarCmp.shootBullet();
        HotlineLA.avatarCmp.shootBulletsR();
    }
    function showVui() {
        document.getElementById("vui").className = "";
    }
    function resetEnemyPositions() {
        for (let i = 0; i < enemyPositionNodes.length; i++) {
            enemyPositionNodes[i].mtxLocal.set(intialenemyTransforms[i]);
        }
    }
    function ResetLevel() {
        HotlineLA.avatarCmp.dead = false;
        enemys.forEach(enemy => {
            enemy.reset();
        });
        resetEnemyPositions();
        HotlineLA.avatarCmp.reset();
        HotlineLA.itemBranch.removeAllChildren();
        HotlineLA.gameState.points = 0;
    }
    function update(_event) {
        HotlineLA.gameState.bulletCount = HotlineLA.avatarCmp.bulletCount;
        f.Physics.settings.solverIterations = 5000;
        f.Physics.simulate(); // if physics is included and used
        viewport.draw();
        f.AudioManager.default.update();
        //f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        //viewport.physicsDebugMode = 2;
        updatePointPositions();
        updateMultiplier();
        if (!HotlineLA.avatarCmp.dead) {
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.W, f.KEYBOARD_CODE.ARROW_UP])) {
                HotlineLA.avatarCmp.moveY(1);
            }
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.S, f.KEYBOARD_CODE.ARROW_DOWN])) {
                HotlineLA.avatarCmp.moveY(-1);
            }
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT])) {
                HotlineLA.avatarCmp.moveX(1);
            }
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT])) {
                HotlineLA.avatarCmp.moveX(-1);
            }
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.L])) {
                HotlineLA.avatarCmp.die();
            }
        }
        updateCamera();
    }
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    var fAid = FudgeAid;
    var f = FudgeCore;
    class avatar extends fAid.NodeSprite {
        constructor() {
            super("avatarSprite");
            this.returnToNormal = () => {
                this.showFrame(0);
            };
        }
        initaliseAnimations(sheetShot, deathImg) {
            let coatShot = new f.CoatTextured(undefined, sheetShot);
            let cmpTransf = new f.ComponentTransform();
            this.armedAnimation = new fAid.SpriteSheetAnimation("Shot", coatShot);
            this.armedAnimation.generateByGrid(f.Rectangle.GET(0, 0, 50, 30), 2, 11, f.ORIGIN2D.CENTER, f.Vector2.X(50));
            let coatDeath = new f.CoatTextured(undefined, deathImg);
            this.deathSprite = new fAid.SpriteSheetAnimation("Death", coatDeath);
            this.deathSprite.generateByGrid(f.Rectangle.GET(0, 0, 55, 30), 1, 11, f.ORIGIN2D.CENTERLEFT, f.Vector2.X(55));
            this.addComponent(cmpTransf);
            this.mtxLocal.translateX(1);
            this.setAnimation(this.armedAnimation);
            this.setFrameDirection(0);
            this.framerate = 0;
        }
        shootAnim() {
            this.showFrame(1);
            new f.Timer(new f.Time, 120, 1, this.returnToNormal);
        }
        setDeathSprite() {
            this.setAnimation(this.deathSprite);
        }
        reset() {
            this.setAnimation(this.armedAnimation);
            this.showFrame(0);
            this.mtxLocal.translation = new f.Vector3(this.mtxLocal.translation.x, this.mtxLocal.translation.y, 0);
        }
    }
    HotlineLA.avatar = avatar;
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
    })(JOB = HotlineLA.JOB || (HotlineLA.JOB = {}));
    class enemyStateMachine extends ƒAid.ComponentStateMachine {
        constructor() {
            super();
            this.timer = null;
            this.IDLE_TIME = 3000;
            this.PATROLL_TIME = 5000;
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        this.enemy = this.node;
                        this.transit(JOB.IDLE);
                        this.timer = new f.Timer(new f.Time, this.IDLE_TIME, 1, this.hndSwitchToPatroll);
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
            this.hndShotDead = (normal) => {
                if (this.timer != null) {
                    this.timer.active = false;
                    this.timer = null;
                }
                this.enemy.handleHeadshotCollision(normal);
                this.transit(JOB.DEAD);
            };
            this.update = (_event) => {
                this.act();
                this.deltaTime = f.Loop.timeFrameGame / 1000;
            };
            this.hndSwitchToPatroll = () => {
                this.transit(JOB.PATROLL);
                this.timer = null;
            };
            this.hndSwitchToIdle = () => {
                this.transit(JOB.IDLE);
                this.timer = null;
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
            //   console.log("Transit to", _machine.stateNext);
        }
        static async actDefault(_machine) {
            if (_machine.enemy.isPlayerInFOV()) {
                _machine.transit(JOB.ATTACK);
            }
        }
        static async actPatroll(_machine) {
            // console.log("Patrolling");
            if (_machine.timer == null) {
                _machine.timer = new f.Timer(new f.Time, _machine.PATROLL_TIME, 1, _machine.hndSwitchToIdle);
            }
            if (_machine.enemy.isPlayerInFOV()) {
                _machine.transit(JOB.ATTACK);
            }
            _machine.enemy.patroll(_machine.deltaTime);
        }
        static async actAttack(_machine) {
            if (_machine.timer != null) {
                _machine.timer.active = false;
                _machine.timer = null;
            }
            if (HotlineLA.avatarCmp.dead) {
                _machine.transit(JOB.IDLE);
            }
            _machine.enemy.chasePlayer();
            //console.log("Attack");
        }
        static async actDead(_machine) {
            if (_machine.timer != null) {
                _machine.timer = null;
            }
            _machine.enemy.cleanUpAfterDeath();
            //  console.log("im Dead");
        }
        static async actIdle(_machine) {
            // if(distance.magnitude <10){
            //
            //  _machine.transit(JOB.ATTACK);
            //}
            if (_machine.timer == null) {
                _machine.timer = new f.Timer(new f.Time, _machine.IDLE_TIME, 1, _machine.hndSwitchToPatroll);
            }
            enemyStateMachine.actDefault(_machine);
        }
        resetState() {
            this.transit(JOB.IDLE);
        }
    }
    enemyStateMachine.iSubclass = f.Component.registerSubclass(enemyStateMachine);
    enemyStateMachine.instructions = enemyStateMachine.get();
    HotlineLA.enemyStateMachine = enemyStateMachine;
})(HotlineLA || (HotlineLA = {}));
var HotlineLA;
(function (HotlineLA) {
    class Point {
        constructor(_gCoordinates, _divElement) {
            this.gameCoordinates = _gCoordinates;
            this.divElement = _divElement;
        }
    }
    HotlineLA.Point = Point;
})(HotlineLA || (HotlineLA = {}));
//# sourceMappingURL=Script.js.map