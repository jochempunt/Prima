"use strict";
var Script;
(function (Script) {
    var fAid = FudgeAid;
    var f_ = FudgeCore;
    class Avatar extends fAid.NodeSprite {
        constructor() {
            super("Avatar");
            this.addComponent(new f_.ComponentTransform((new f_.Matrix4x4())));
            //this.initializeAnimations();
        }
        initializeAnimations(sheetFrames, sheetWalk, sheetMoves) {
            let coatWalk = new f_.CoatTextured(undefined, sheetWalk);
            this.animWalk = new fAid.SpriteSheetAnimation("Walk", coatWalk);
            this.animWalk.generateByGrid(f_.Rectangle.GET(3, 0, 17, 33), 4, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(17));
            let coatFrames = new f_.CoatTextured(undefined, sheetFrames);
            this.animFrames = new fAid.SpriteSheetAnimation("Frames", coatFrames);
            this.animFrames.generateByGrid(f_.Rectangle.GET(0, 0, 18, 33), 2, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(19));
            let coatMoveses = new f_.CoatTextured(undefined, sheetMoves);
            this.animMoves = new fAid.SpriteSheetAnimation("Moves", coatMoveses);
            this.animMoves.generateByGrid(f_.Rectangle.GET(0, 0, 19, 33), 2, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(17));
            this.setAnimation(this.animMoves);
            this.setFrameDirection(1);
            this.framerate = 1;
            this.mtxLocal.translateY(-1);
        }
        setWalk() {
            this.setAnimation(this.animWalk);
            this.framerate = 12;
            this.setFrameDirection(1);
            this.currAnim = Script.AnimationState.WALK;
        }
        setFall() {
            this.setAnimation(this.animMoves);
            this.showFrame(1);
            this.currAnim = Script.AnimationState.MOVES;
        }
        setSlide() {
            this.setAnimation(this.animMoves);
            this.showFrame(0);
            this.currAnim = Script.AnimationState.MOVES;
        }
        setDuck() {
            this.setAnimation(this.animFrames);
            this.showFrame(1);
            this.currAnim = Script.AnimationState.MOVES;
        }
        setStand() {
            this.setAnimation(this.animFrames);
            this.showFrame(0);
            this.currAnim = Script.AnimationState.FRAMES;
        }
    }
    Script.Avatar = Avatar;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var f_ = FudgeCore;
    f_.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let marioTransformNode;
    let avatarInstance;
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
    let gravity = -80;
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
    let cmpAudioMario;
    let audioJump;
    let audioDeath;
    let cmpAudio;
    let marioMutator;
    let tranformComponentMario = undefined;
    //------------- Animation Variables ------------//
    let currentAnim = undefined;
    let AnimationState;
    (function (AnimationState) {
        AnimationState[AnimationState["WALK"] = 0] = "WALK";
        AnimationState[AnimationState["FRAMES"] = 1] = "FRAMES";
        AnimationState[AnimationState["MOVES"] = 2] = "MOVES";
    })(AnimationState = Script.AnimationState || (Script.AnimationState = {}));
    //let animFramesStr: string = "animFrames";
    // let animWalk: string = "animWalk";
    //let animMoves: string = "animMoves";
    let branch = undefined;
    let cmpCamera = undefined;
    //------------- functions ------------//
    function start(_event) {
        viewport = _event.detail;
        f_.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        branch = viewport.getBranch();
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
            imgSpriteSheetWalk = new f_.TextureImage();
            imgSpriteSheetFrames = new f_.TextureImage();
            imgSpriteSheetMoves = new f_.TextureImage();
            await imgSpriteSheetWalk.load("./Images/mario_walk2.png");
            await imgSpriteSheetFrames.load("./Images/marioFrames.png");
            await imgSpriteSheetMoves.load("./Images/marioMoves.png");
        }
        catch (e) {
            console.log(e);
        }
        avatarInstance = new Script.Avatar();
        avatarInstance.initializeAnimations(imgSpriteSheetFrames, imgSpriteSheetWalk, imgSpriteSheetMoves);
        //spriteNode = new fAid.NodeSprite("MarioSprite");
        //spriteNode.addComponent(new f_.ComponentTransform(new f_.Matrix4x4()));
        //spriteNode.setAnimation(animMoves);
        //spriteNode.setFrameDirection(1);
        //spriteNode.mtxLocal.translateY(-1);
        //spriteNode.framerate = 1;
        marioTransformNode.removeAllChildren();
        // marioTransformNode.appendChild(spriteNode);
        marioTransformNode.appendChild(avatarInstance);
        marioTransformNode.getComponent(f_.ComponentTransform).mtxLocal.scaleX(0.5);
        marioTransformNode.getComponent(f_.ComponentTransform).mtxLocal.scaleY(0.5);
        cmpCamera = viewport.camera;
        cmpCamera.mtxPivot.translateZ(-20);
        // cmpCamera.mtxPivot.rotateY(180);
        tranformComponentMario = marioTransformNode.getComponent(f_.ComponentTransform);
        audioJump = new f_.Audio("./Sounds/JumpSound.mp3");
        audioDeath = new f_.Audio("./Sounds/death_sound.mp3");
        cmpAudioMario = new f_.ComponentAudio(audioJump, false, false);
        cmpAudioMario.connect(true);
        marioMutator = tranformComponentMario.getMutator();
        console.log(marioMutator.mtxLocal.translation);
        cmpAudio = branch.getComponent(f_.ComponentAudio);
        // 
        console.log("full branch");
        console.log(viewport.getBranch().getAllComponents());
        console.log(cmpAudio);
        cmpAudio.volume = 1;
        f_.Loop.start(f_.LOOP_MODE.TIME_GAME);
    }
    // function inspired by unitys "mathf.MoveTowards()" function
    function moveTowards(currentN, targetN, maxDelta) {
        if (Math.abs(targetN - currentN) <= maxDelta) {
            return targetN;
        }
        return currentN + Math.sign(targetN - currentN) * maxDelta;
    }
    function updateCamera() {
        let pos = marioTransformNode.mtxLocal.translation;
        let origin = cmpCamera.mtxPivot.translation;
        cmpCamera.mtxPivot.translation = new f_.Vector3(pos.x, origin.y, origin.z);
    }
    function inAir() {
        onGround = false;
    }
    function checkCollision() {
        let pos = marioTransformNode.mtxLocal.translation;
        for (let floor of floorNodes) {
            let posBlock = floor.mtxLocal.translation;
            if (Math.abs(pos.x - posBlock.x) < 1) {
                if (pos.y < posBlock.y + 0.5 && pos.y > posBlock.y - 0.1) {
                    pos.y = posBlock.y + 0.5;
                    marioTransformNode.mtxLocal.translation = pos;
                    marioVelocityY = 0;
                    onGround = true;
                }
                else {
                    onGround = false;
                }
            }
        }
    }
    let gameOver = false;
    function resetLevel() {
        gravity = 0;
        marioVelocityY = 0;
        gameOver = true;
        setTimeout(marioBack, 2000);
    }
    function marioBack() {
        cmpAudio.play(true);
        tranformComponentMario.mtxLocal.translation = new f_.Vector3(0, 1, 0);
        marioVelocityY = 0;
        //tranformComponentMario.updateMutator(marioMutator);
        gameOver = false;
        gravity = -80;
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        deltaTime = f_.Loop.timeFrameGame / 1000;
        if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.SHIFT_LEFT])) {
            currMarioSpeed = sprintSpeed;
            avatarInstance.framerate = frameRtSprint;
        }
        else {
            currMarioSpeed = walkSpeed;
        }
        if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.SPACE]) && onGround && !hasJumped) {
            cmpAudioMario.setAudio(audioJump);
            marioVelocityY = jumpForce;
            cmpAudioMario.volume = 1;
            cmpAudioMario.play(true);
            hasJumped = true;
            inAir();
        }
        else if (!f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.SPACE])) {
            hasJumped = false;
        }
        // !!Old way:    distanceX = currMarioSpeed * deltaTime;
        marioVelocityY += gravity * deltaTime;
        distanceY = marioVelocityY * deltaTime;
        if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.D, f_.KEYBOARD_CODE.A])) {
            direction = (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.D]) ? 1 : -1);
            //console.log("direction:" + direction);
            lastDirection = Number(direction);
            if (avatarInstance.currAnim != AnimationState.WALK) {
                avatarInstance.setWalk();
            }
            if (onGround) {
                if (Math.sign(marioVelocityX) != Math.sign(direction) || (marioVelocityX == 0)) {
                    avatarInstance.setSlide();
                }
                if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.S])) {
                    avatarInstance.setDuck();
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
                avatarInstance.setStand();
                //avatarInstance.setAnimation(animFrames);
                //avatarInstance.showFrame(0);
            }
            direction = 0;
            marioVelocityX = moveTowards(marioVelocityX, direction * currMarioSpeed, marioDeccellerationX * currMarioSpeed * deltaTime);
        }
        if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.S])) {
            avatarInstance.setDuck();
            //avatarInstance.setAnimation(animFramesStr);
            //avatarInstance.showFrame(1);
            //currentAnim = animFramesStr;
        }
        spriteRotation = (lastDirection == -1) ? -180 : 0;
        avatarInstance.getComponent(f_.ComponentTransform).mtxLocal.rotation = new f_.Vector3(0, spriteRotation, 0);
        distanceX = marioVelocityX * deltaTime;
        tranformComponentMario.mtxLocal.translation = new f_.Vector3(tranformComponentMario.mtxLocal.translation.x + distanceX, tranformComponentMario.mtxLocal.translation.y + distanceY, tranformComponentMario.mtxLocal.translation.z);
        if (!onGround) {
            avatarInstance.setFall();
            //avatarInstance.setAnimation(animMoves);
            //avatarInstance.showFrame(1);
        }
        if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.ARROW_UP])) {
            marioMutator.mtxLocal.rotation = new f_.Vector3(marioMutator.mtxLocal.rotation.x, marioMutator.mtxLocal.rotation.y + 2, 0);
            tranformComponentMario.updateMutator(marioMutator);
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
        if (marioTransformNode.mtxLocal.translation.y < -5 && !gameOver) {
            gameOver = true;
            cmpAudio.play(false);
            cmpAudioMario.setAudio(audioDeath);
            cmpAudioMario.play(true);
            cmpAudioMario.volume = 5;
            console.log(marioTransformNode.mtxLocal.translation.y);
            resetLevel();
        }
        checkCollision();
        updateCamera();
        //checkCollision(); --> bei scheißformen AABB(mehr rechenaufwand)  ||oder kreise ; d<radius1 + radius2
        viewport.draw(); // test rectangle
        // für Y collison .> inverse world transform  [Hirnen!!]
        f_.AudioManager.default.update();
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class ScriptRotator extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "CustomComponentScript added to ";
            this.speead = 30;
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Debug.log(this.message, this.node);
                        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update.bind(this));
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
            this.update = () => {
                //let transformComponent: ƒ.ComponentTransform = this.node.getComponent(ƒ.ComponentTransform);
                this.node.mtxLocal.rotateY(this.speead * ƒ.Loop.timeFrameGame / 1000);
                // console.log(this);
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
    ScriptRotator.iSubclass = ƒ.Component.registerSubclass(ScriptRotator);
    Script.ScriptRotator = ScriptRotator;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map