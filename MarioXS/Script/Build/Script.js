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
    let spriteNode;
    let floorNodes;
    //------- animation Framerates -------//
    const frameRtWalk = 12;
    const frameRtSprint = 16;
    //---------- game constants ----------//
    const walkSpeed = 10.0;
    const sprintSpeed = 15.0;
    const marioAccellartionX = 3.7;
    const marioDeccellerationX = 7;
    const gravity = -80;
    const jumpForce = 18;
    //------------- variables ------------//
    let onGround = true;
    let spriteRotation = 0;
    let direction = 1;
    let currMarioSpeed = 0.0;
    let marioVelocityX = 0;
    let marioVelocityY = 0;
    let distanceX = 0;
    let distanceY = 0;
    let deltaTime = 0;
    let lastDirection = 0;
    let hasJumped = false;
    let tranformComponentMario = undefined;
    //------------- Animation Variables ------------//
    let currentAnim = undefined;
    let animFrames = undefined;
    let animWalk = undefined;
    let animMoves = undefined;
    //------------- functions ------------//
    function start(_event) {
        viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        let branch = viewport.getBranch();
        marioTransformNode = branch.getChildrenByName("MarioTransform")[0];
        let floor = branch.getChildrenByName("floors")[0];
        floorNodes = floor.getChildren();
        console.log(floorNodes);
        hndLoad();
    }
    async function hndLoad() {
        let imgSpriteSheetWalk;
        let imgSpriteSheetFrames;
        let imgSpriteSheetMoves;
        try {
            imgSpriteSheetWalk = new ƒ.TextureImage();
            imgSpriteSheetFrames = new ƒ.TextureImage();
            imgSpriteSheetMoves = new ƒ.TextureImage();
            await imgSpriteSheetWalk.load("./Images/mario_walk2.png");
            await imgSpriteSheetFrames.load("./Images/marioFrames.png");
            await imgSpriteSheetMoves.load("./Images/marioMoves.png");
        }
        catch (e) {
            console.log(e);
        }
        let coatWalk = new ƒ.CoatTextured(undefined, imgSpriteSheetWalk);
        animWalk = new ƒAid.SpriteSheetAnimation("Walk", coatWalk);
        animWalk.generateByGrid(ƒ.Rectangle.GET(3, 0, 17, 33), 4, 11, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(17));
        let coatFrames = new ƒ.CoatTextured(undefined, imgSpriteSheetFrames);
        animFrames = new ƒAid.SpriteSheetAnimation("Frames", coatFrames);
        animFrames.generateByGrid(ƒ.Rectangle.GET(0, 0, 18, 33), 2, 11, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(19));
        let coatMoveses = new ƒ.CoatTextured(undefined, imgSpriteSheetMoves);
        animMoves = new ƒAid.SpriteSheetAnimation("Moves", coatMoveses);
        animMoves.generateByGrid(ƒ.Rectangle.GET(0, 0, 19, 33), 2, 11, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(17));
        spriteNode = new ƒAid.NodeSprite("MarioSprite");
        spriteNode.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
        spriteNode.setAnimation(animMoves);
        spriteNode.setFrameDirection(1);
        spriteNode.mtxLocal.translateY(-1);
        spriteNode.framerate = 1;
        marioTransformNode.removeAllChildren();
        marioTransformNode.appendChild(spriteNode);
        marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.scaleX(0.5);
        marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.scaleY(0.5);
        tranformComponentMario = marioTransformNode.getComponent(ƒ.ComponentTransform);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME);
    }
    // function inspired by unitys "mathf.MoveTowards()" function
    function moveTowards(currentN, targetN, maxDelta) {
        if (Math.abs(targetN - currentN) <= maxDelta) {
            return targetN;
        }
        return currentN + Math.sign(targetN - currentN) * maxDelta;
    }
    function inAir() {
        onGround = false;
    }
    function checkCollision() {
        let pos = marioTransformNode.mtxLocal.translation;
        for (let floor of floorNodes) {
            let posBlock = floor.mtxLocal.translation;
            if (Math.abs(pos.x - posBlock.x) < 1) {
                if (pos.y < posBlock.y + 0.5 && pos.y > posBlock.y - 0.5) {
                    pos.y = posBlock.y + 0.5;
                    marioTransformNode.mtxLocal.translation = pos;
                    marioVelocityY = 0;
                    onGround = true;
                }
                else {
                    //inAir();
                }
            }
        }
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        deltaTime = ƒ.Loop.timeFrameGame / 1000;
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT])) {
            currMarioSpeed = sprintSpeed;
            spriteNode.framerate = frameRtSprint;
        }
        else {
            currMarioSpeed = walkSpeed;
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && onGround && !hasJumped) {
            marioVelocityY = jumpForce;
            hasJumped = true;
            inAir();
        }
        else if (!ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
            hasJumped = false;
        }
        // !!Old way:    distanceX = currMarioSpeed * deltaTime;
        marioVelocityY += gravity * deltaTime;
        distanceY = marioVelocityY * deltaTime;
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.A])) {
            direction = (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D]) ? 1 : -1);
            //console.log("direction:" + direction);
            lastDirection = Number(direction);
            if (currentAnim != animWalk) {
                spriteNode.setAnimation(animWalk);
                spriteNode.framerate = frameRtWalk;
                currentAnim = animWalk;
            }
            if (onGround) {
                if (Math.sign(marioVelocityX) != Math.sign(direction) || (marioVelocityX == 0)) {
                    spriteNode.setAnimation(animMoves);
                    spriteNode.showFrame(0);
                    currentAnim = animMoves;
                }
                if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) {
                    spriteNode.setAnimation(animFrames);
                    spriteNode.showFrame(1);
                    currentAnim = animFrames;
                    marioVelocityX = moveTowards(marioVelocityX, 0, marioAccellartionX * currMarioSpeed * deltaTime);
                }
                else {
                    marioVelocityX = moveTowards(marioVelocityX, direction * currMarioSpeed, marioAccellartionX * currMarioSpeed * deltaTime);
                }
            }
            else {
                marioVelocityX = moveTowards(marioVelocityX, 0.9 * direction * currMarioSpeed, 0);
            }
        }
        else {
            if (onGround) {
                spriteNode.setAnimation(animFrames);
                currentAnim = animFrames;
                spriteNode.showFrame(0);
            }
            direction = 0;
            marioVelocityX = moveTowards(marioVelocityX, direction * currMarioSpeed, marioDeccellerationX * currMarioSpeed * deltaTime);
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) {
            spriteNode.setAnimation(animFrames);
            spriteNode.showFrame(1);
            currentAnim = animFrames;
        }
        spriteRotation = (lastDirection == -1) ? -180 : 0;
        spriteNode.getComponent(ƒ.ComponentTransform).mtxLocal.rotation = new ƒ.Vector3(0, spriteRotation, 0);
        distanceX = marioVelocityX * deltaTime;
        tranformComponentMario.mtxLocal.translation = new ƒ.Vector3(tranformComponentMario.mtxLocal.translation.x + distanceX, tranformComponentMario.mtxLocal.translation.y + distanceY, tranformComponentMario.mtxLocal.translation.z);
        if (!onGround) {
            spriteNode.setAnimation(animMoves);
            currentAnim = animMoves;
            spriteNode.showFrame(1);
        }
        //mutatoren
        /*
            if (tranformComponentMario.mtxLocal.translation.y <= -0.7) {
              tranformComponentMario.mtxLocal.translation = new ƒ.Vector3(tranformComponentMario.mtxLocal.translation.x, -0.7, tranformComponentMario.mtxLocal.translation.z);
              marioVelocityY = 0;
              onGround = true;
            } else {
              onGround = false;
              spriteNode.setAnimation(animMoves);
              currentAnim = animMoves;
              spriteNode.showFrame(1);
            }
        */
        checkCollision();
        //checkCollision(); --> bei scheißformen AABB(mehr rechenaufwand)  ||oder kreise ; d<radius1 + radius2
        viewport.draw(); // test rectangle
        // für Y collison .> inverse world transform  [Hirnen!!]
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map