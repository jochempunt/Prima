"use strict";
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
                        this.torsoNode = this.node.getChild(0);
                        this.gunNode = this.torsoNode.getChild(0);
                        window.addEventListener("mousemove", this.rotateToMousePointer);
                        this.rgdBody.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, this.hndCollison);
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            this.hndCollison = () => {
                //  console.log("collided");
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
        shootBullet() {
            if (!this.shootAgain) {
                return;
            }
            let bullet = new f.Node("bullet");
            let bulletSprite = new f.MeshSprite("bulletMesh");
            let bulletMaterial = new f.Material("bulletMaterial", f.ShaderLit);
            let componentMesh = new f.ComponentMesh(bulletSprite);
            componentMesh.mtxPivot.scale(new f.Vector3(0.2, 0.2, 1));
            let componentMat = new f.ComponentMaterial(bulletMaterial);
            componentMat.clrPrimary = f.Color.CSS("black");
            let componentTransf = new f.ComponentTransform();
            componentTransf.mtxLocal.translation = this.gunNode.mtxWorld.translation;
            componentTransf.mtxLocal.translateZ(-0.1);
            bullet.addComponent(componentMesh);
            bullet.addComponent(componentMat);
            bullet.addComponent(componentTransf);
            let componentRigidbody = new f.ComponentRigidbody();
            componentRigidbody.effectGravity = 0;
            componentRigidbody.mass = 0.1;
            componentRigidbody.isTrigger = true;
            bullet.addComponent(componentRigidbody);
            HotlineLA.branch.addChild(bullet);
            // TODO: make the bullet precisely go from the initial position to the target point 
            bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse(f.Vector3.NORMALIZATION(new f.Vector3(this.targetX, -this.targetY, 0), this.bulletSpeed));
            this.shootAgain = false;
            let time = new f.Time();
            let timer = new f.Timer(time, 150, 1, this.hndTime);
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
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let avatarCmp;
    let avatarNode;
    let cmpCamera;
    function start(_event) {
        viewport = _event.detail;
        HotlineLA.branch = viewport.getBranch();
        avatarNode = HotlineLA.branch.getChildrenByName("avatar")[0];
        avatarCmp = avatarNode.getComponent(HotlineLA.CharacterMovementScript);
        cmpCamera = viewport.camera;
        cmpCamera.mtxPivot.translation = new f.Vector3(0, 0, -15);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function updateCamera() {
        cmpCamera.mtxPivot.translation = new f.Vector3(-avatarNode.mtxLocal.translation.x, avatarNode.mtxLocal.translation.y, cmpCamera.mtxPivot.translation.z);
    }
    function update(_event) {
        f.Physics.simulate(); // if physics is included and used
        viewport.draw();
        f.AudioManager.default.update();
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
//# sourceMappingURL=Script.js.map