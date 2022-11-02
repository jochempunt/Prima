namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let marioTransformNode: ƒ.Node;
  let spriteNode: ƒAid.NodeSprite;
  let floorNodes: ƒ.Node[];
  //------- animation Framerates -------//
  const frameRtWalk: number = 12;
  const frameRtSprint: number = 16;
  //---------- game constants ----------//
  const walkSpeed: number = 10.0;
  const sprintSpeed: number = 15.0;
  const marioAccellartionX = 3.7;
  const marioDeccellerationX = 7;
  const gravity: number = -80;
  const jumpForce: number = 18;
  //------------- variables ------------//

  let onGround: boolean = true;
  let spriteRotation = 0;
  let direction: number = 1;
  let currMarioSpeed = 0.0;
  let marioVelocityX: number = 0;
  let marioVelocityY: number = 0;
  let distanceX: number = 0;
  let distanceY: number = 0;
  let deltaTime = 0;
  let lastDirection: number = 0;
  let hasJumped = false;

  let cmpAudioMario:ƒ.ComponentAudio;
  let audioJump: ƒ.Audio;


  let tranformComponentMario: ƒ.ComponentTransform = undefined;
  //------------- Animation Variables ------------//
  let currentAnim: ƒAid.SpriteSheetAnimation = undefined;
  let animFrames: ƒAid.SpriteSheetAnimation = undefined;
  let animWalk: ƒAid.SpriteSheetAnimation = undefined;
  let animMoves: ƒAid.SpriteSheetAnimation = undefined;
  let branch: ƒ.Node= undefined;
  //------------- functions ------------//
  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    branch = viewport.getBranch();
    marioTransformNode = branch.getChildrenByName("MarioTransform")[0];
    let floor: ƒ.Node = branch.getChildrenByName("floors")[0];
    
    floorNodes = floor.getChildren();
    console.log(floorNodes);
    hndLoad();
  
  }


  async function hndLoad(): Promise<void> {
    let imgSpriteSheetWalk: ƒ.TextureImage;
    let imgSpriteSheetFrames: ƒ.TextureImage;
    let imgSpriteSheetMoves: ƒ.TextureImage;
    try {
      imgSpriteSheetWalk = new ƒ.TextureImage();
      imgSpriteSheetFrames = new ƒ.TextureImage();
      imgSpriteSheetMoves = new ƒ.TextureImage();
      await imgSpriteSheetWalk.load("./Images/mario_walk2.png");
      await imgSpriteSheetFrames.load("./Images/marioFrames.png");
      await imgSpriteSheetMoves.load("./Images/marioMoves.png");
    } catch (e: any) {
      console.log(e);
    }

    let coatWalk: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheetWalk);
    animWalk = new ƒAid.SpriteSheetAnimation("Walk", coatWalk);
    animWalk.generateByGrid(ƒ.Rectangle.GET(3, 0, 17, 33), 4, 11, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(17));

    let coatFrames: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheetFrames);
    animFrames = new ƒAid.SpriteSheetAnimation("Frames", coatFrames);
    animFrames.generateByGrid(ƒ.Rectangle.GET(0, 0, 18, 33), 2, 11, ƒ.ORIGIN2D.BOTTOMCENTER, ƒ.Vector2.X(19));

    let coatMoveses: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheetMoves);
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
    audioJump = new ƒ.Audio("./Sounds/JumpSound.mp3");
    cmpAudioMario =  new ƒ.ComponentAudio(audioJump, false, false);
    cmpAudioMario.connect(true);



    let cmpAudio: ƒ.ComponentAudio = branch.getComponent(ƒ.ComponentAudio);
    console.log(cmpAudio);
    cmpAudio.volume = 1;

    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME);
  }


  // function inspired by unitys "mathf.MoveTowards()" function
  function moveTowards(currentN: number, targetN: number, maxDelta: number): number {
    if (Math.abs(targetN - currentN) <= maxDelta) {
      return targetN;
    }
    return currentN + Math.sign(targetN - currentN) * maxDelta;
  }



  function inAir(): void {
    onGround = false;

  }

  function checkCollision(): void {
    let pos: ƒ.Vector3 = marioTransformNode.mtxLocal.translation;
    for (let floor of floorNodes) {
      let posBlock: ƒ.Vector3 = floor.mtxLocal.translation;
      if (Math.abs(pos.x - posBlock.x) < 1) {
        if (pos.y < posBlock.y + 0.5 && pos.y > posBlock.y - 0.8 ) {
          pos.y = posBlock.y + 0.5;
          marioTransformNode.mtxLocal.translation = pos;
          marioVelocityY = 0;
          onGround = true;
        } else {
          //inAir();
        }
      }
    }
  }



  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    deltaTime = ƒ.Loop.timeFrameGame / 1000;

    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT])) {
      currMarioSpeed = sprintSpeed;
      spriteNode.framerate = frameRtSprint;
    } else {
      currMarioSpeed = walkSpeed;
    }

    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && onGround && !hasJumped) {
      marioVelocityY = jumpForce;
      cmpAudioMario.play(true);
      hasJumped = true;
      inAir();
    } else if (!ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
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
        } else {
          marioVelocityX = moveTowards(marioVelocityX, direction * currMarioSpeed, marioAccellartionX * currMarioSpeed * deltaTime);
        }
      } else {
        marioVelocityX = moveTowards(marioVelocityX, 0.9 * direction * currMarioSpeed, 0);
      }
    } else {
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
}