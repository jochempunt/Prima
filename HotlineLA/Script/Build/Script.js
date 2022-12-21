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
            this.playerSpeed = 100;
            this.bulletSpeed = 8;
            this.shootAgain = true;
            this.bulletCount = 0;
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
                        this.torsoNode = this.node.getChild(0);
                        this.gunNode = this.torsoNode.getChild(0);
                        window.addEventListener("mousemove", this.rotateToMousePointer);
                        //this.rgdBody.addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, this.hndCollison);
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            this.hndBulletHit = (event) => {
                //  console.log("collided");
                console.log(event);
            };
            this.moveY = (direction) => {
                this.rgdBody.applyForce(new f.Vector3(0, direction * this.playerSpeed, 0));
                //this.rgdBody.applyLinearImpulse(new f.Vector3( 0,direction * 12,0));
                console.log("up " + this.playerSpeed);
            };
            this.moveX = (direction) => {
                this.rgdBody.applyForce(new f.Vector3(direction * this.playerSpeed, 0, 0));
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
                bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse(f.Vector3.NORMALIZATION(new f.Vector3(this.targetX - this.gunNode.mtxWorld.translation.x, -(this.targetY - this.gunNode.mtxWorld.translation.y), 0), this.bulletSpeed));
                //bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse( f.Vector3.NORMALIZATION( new f.Vector3(this.targetX ,-this.targetY,0),this.bulletSpeed));
                this.shootAgain = false;
                let time = new f.Time();
                let timer = new f.Timer(time, 150, 1, this.hndTime);
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
            this.hndTrigger = (event) => {
                if (event.cmpRigidbody.node.name == "bullet") {
                    this.setAnimation(this.animShotDeath);
                    this.animState = AnimationState.DEADSHOT;
                    this.framerate = 10;
                }
            };
            this.update = () => {
                if (this.animState == AnimationState.DEADSHOT) {
                    this.removeEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, this.hndTrigger);
                    this.removeComponent(this.rdgBody);
                    if (this.getCurrentFrame >= 3) {
                        this.showFrame(3);
                        this.framerate = 0;
                        this.setFrameDirection(0);
                        this.animState = AnimationState.WALK;
                    }
                }
            };
            this.addComponent(new f.ComponentTransform((new f.Matrix4x4())));
            this.rdgBody = new f.ComponentRigidbody();
            this.rdgBody.effectGravity = 0;
            this.rdgBody.mass = 0.1;
            this.rdgBody.typeBody = f.BODY_TYPE.KINEMATIC;
            this.rdgBody.effectRotation.x = 0;
            this.rdgBody.effectRotation.y = 0;
            this.addComponent(this.rdgBody);
        }
        initializeAnimations(sheetWalk, sheetShotDeath) {
            let coatWalk = new f.CoatTextured(undefined, sheetWalk);
            this.animWalk = new fAid.SpriteSheetAnimation("Walk", coatWalk);
            this.animWalk.generateByGrid(f.Rectangle.GET(4, 0, 25, 30), 9, 11, f.ORIGIN2D.CENTER, f.Vector2.X(33));
            let coatDeathShot = new f.CoatTextured(undefined, sheetShotDeath);
            this.animShotDeath = new fAid.SpriteSheetAnimation("Walk", coatDeathShot);
            this.animShotDeath.generateByGrid(f.Rectangle.GET(2, 0, 60, 30), 5, 11, f.ORIGIN2D.CENTERLEFT, f.Vector2.X(60));
            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 4;
            this.rdgBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, this.hndTrigger);
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
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
    let avatarNode;
    let enemys;
    let enemyPos;
    let cmpCamera;
    function start(_event) {
        viewport = _event.detail;
        HotlineLA.branch = viewport.getBranch();
        avatarNode = HotlineLA.branch.getChildrenByName("avatar")[0];
        avatarCmp = avatarNode.getComponent(HotlineLA.CharacterMovementScript);
        cmpCamera = viewport.camera;
        loadEnemys();
        cmpCamera.mtxPivot.translation = new f.Vector3(0, 0, -15);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        HotlineLA.branch.addEventListener("BulletHit", hndBulletHit);
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
        enemyNode.initializeAnimations(imgSpriteSheetWalk, imgSpriteSheehtShotDead);
        enemyPos.appendChild(enemyNode);
    }
    let bulletToRemove;
    function hndBulletHit(event) {
        //  console.log("collided");
        bulletToRemove = event.target;
        console.log(bulletToRemove.name);
        //bulletToRemove.removeComponent(bulletToRemove.getComponent(BulletScript));
        setTimeout(removeBullet, 1);
    }
    function removeBullet() {
        HotlineLA.branch.removeChild(bulletToRemove);
    }
    function updateCamera() {
        cmpCamera.mtxPivot.translation = new f.Vector3(-avatarNode.mtxLocal.translation.x, avatarNode.mtxLocal.translation.y, cmpCamera.mtxPivot.translation.z);
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
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["ATTACK"] = 1] = "ATTACK";
        JOB[JOB["DEAD"] = 2] = "DEAD";
    })(JOB || (JOB = {}));
    class enemyStateMachine extends ƒAid.ComponentStateMachine {
        constructor() {
            super();
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        this.transit(JOB.IDLE);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        this.turretHead = this.node.getChild(0);
                        break;
                }
            };
            this.update = (_event) => {
                this.act();
            };
            this.instructions = enemyStateMachine.instructions; // setup instructions with the static set
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
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
            setup.setAction(JOB.ATTACK, this.actAttack);
            return setup;
        }
        static transitDefault(_machine) {
            console.log("Transit to", _machine.stateNext);
        }
        static async actDefault(_machine) {
            console.log("Attack");
        }
        static async actAttack(_machine) {
            //
            console.log("pipi");
        }
        static async actIdle(_machine) {
            _machine.turretHead.mtxLocal.rotateY(2);
            // if(distance.magnitude <10){
            //
            //  _machine.transit(JOB.ATTACK);
            //} 
            enemyStateMachine.actDefault(_machine);
        }
    }
    enemyStateMachine.iSubclass = ƒ.Component.registerSubclass(enemyStateMachine);
    enemyStateMachine.instructions = enemyStateMachine.get();
    Script.enemyStateMachine = enemyStateMachine;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map