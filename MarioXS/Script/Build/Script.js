"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
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
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let marioTransformNode;
    let marioNode;
    let spriteNode;
    let marioSpeed = 0.0;
    let walkSpeed = 3.0;
    let sprintSpeed = 10;
    function start(_event) {
        viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        //ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
        let branch = viewport.getBranch();
        marioTransformNode = branch.getChildrenByName("MarioTransform")[0];
        marioNode = marioTransformNode.getChildrenByName("Mario")[0];
        hndLoad();
    }
    async function hndLoad() {
        //let root: ƒ.Node = new ƒ.Node("root");
        let imgSpriteSheet;
        try {
            imgSpriteSheet = new ƒ.TextureImage();
            await imgSpriteSheet.load("./Images/mario_walk2.png");
        }
        catch (e) {
            console.log(e);
        }
        let coat = new ƒ.CoatTextured(undefined, imgSpriteSheet);
        console.log(coat);
        let animation = new ƒAid.SpriteSheetAnimation("Walk", coat);
        animation.generateByGrid(ƒ.Rectangle.GET(3, 0, 17, 33), 4, 11, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(17));
        //todo jump
        spriteNode = new ƒAid.NodeSprite("MarioSprite");
        spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spriteNode.setAnimation(animation);
        spriteNode.setFrameDirection(1);
        spriteNode.mtxLocal.translateY(-1);
        spriteNode.framerate = 12;
        marioTransformNode.removeAllChildren();
        marioTransformNode.appendChild(spriteNode);
        //root.addChild(spriteNode);
        // setup viewport
        marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.scaleX(0.5);
        marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.scaleY(0.5);
        //viewport.draw();
        //ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 30);
        //document.forms[0].addEventListener("change", handleChange);
    }
    let directionRight = true;
    let distance = 0;
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        console.log("update");
        console.log(ƒ.Loop.timeFrameGame);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT])) {
            marioSpeed = sprintSpeed;
        }
        else {
            marioSpeed = walkSpeed;
        }
        distance = marioSpeed / 1000 * ƒ.Loop.timeFrameGame;
        console.log(marioSpeed);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
            marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.translateX(distance);
            if (!directionRight) {
                spriteNode.getComponent(ƒ.ComponentTransform).mtxLocal.rotateY(180);
                directionRight = true;
            }
        }
        else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
            marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.translateX(-distance);
            if (directionRight) {
                spriteNode.getComponent(ƒ.ComponentTransform).mtxLocal.rotateY(180);
                directionRight = false;
            }
        }
        else {
            spriteNode.showFrame(1);
        }
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map