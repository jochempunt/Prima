namespace Script {
  import f_ = FudgeCore;
  import fAid = FudgeAid;
  f_.Debug.info("Main Program Template running!");

  let viewport: f_.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let marioTransformNode: f_.Node;
  let spriteNode: fAid.NodeSprite;
  let floorNodes: f_.Node[];
  //------- animation Framerates -------//
  const frameRtWalk: number = 12;
  const frameRtSprint: number = 16;
  //---------- game constants ----------//
  const walkSpeed: number = 10.0;
  const sprintSpeed: number = 15.0;
  const marioAccellartionX = 3.7;
  const marioDeccellerationX = 7;
  let gravity: number = -80;
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

  let cmpAudioMario: f_.ComponentAudio;
  let audioJump: f_.Audio;
  let audioDeath: f_.Audio;
  let cmpAudio: f_.ComponentAudio;

  let marioMutator: f_.Mutator;



  let tranformComponentMario: f_.ComponentTransform = undefined;
  //------------- Animation Variables ------------//
  let currentAnim: fAid.SpriteSheetAnimation = undefined;
  let animFrames: fAid.SpriteSheetAnimation = undefined;
  let animWalk: fAid.SpriteSheetAnimation = undefined;
  let animMoves: fAid.SpriteSheetAnimation = undefined;
  let branch: f_.Node = undefined;

  let cmpCamera: f_.ComponentCamera = undefined;
  //------------- functions ------------//
  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    f_.Loop.addEventListener(f_.EVENT.LOOP_FRAME, update);
    branch = viewport.getBranch();
    marioTransformNode = branch.getChildrenByName("MarioTransform")[0];

    let floor: f_.Node = branch.getChildrenByName("floors")[0];
    floorNodes = floor.getChildren();
    console.log(floorNodes);
    hndLoad();
  }


  async function hndLoad(): Promise<void> {
    let imgSpriteSheetWalk: f_.TextureImage;
    let imgSpriteSheetFrames: f_.TextureImage;
    let imgSpriteSheetMoves: f_.TextureImage;
    try {
      imgSpriteSheetWalk = new f_.TextureImage();
      imgSpriteSheetFrames = new f_.TextureImage();
      imgSpriteSheetMoves = new f_.TextureImage();
      await imgSpriteSheetWalk.load("./Images/mario_walk2.png");
      await imgSpriteSheetFrames.load("./Images/marioFrames.png");
      await imgSpriteSheetMoves.load("./Images/marioMoves.png");
    } catch (e: any) {
      console.log(e);
    }

    let coatWalk: f_.CoatTextured = new f_.CoatTextured(undefined, imgSpriteSheetWalk);
    animWalk = new fAid.SpriteSheetAnimation("Walk", coatWalk);
    animWalk.generateByGrid(f_.Rectangle.GET(3, 0, 17, 33), 4, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(17));

    let coatFrames: f_.CoatTextured = new f_.CoatTextured(undefined, imgSpriteSheetFrames);
    animFrames = new fAid.SpriteSheetAnimation("Frames", coatFrames);
    animFrames.generateByGrid(f_.Rectangle.GET(0, 0, 18, 33), 2, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(19));

    let coatMoveses: f_.CoatTextured = new f_.CoatTextured(undefined, imgSpriteSheetMoves);
    animMoves = new fAid.SpriteSheetAnimation("Moves", coatMoveses);
    animMoves.generateByGrid(f_.Rectangle.GET(0, 0, 19, 33), 2, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(17));

    spriteNode = new fAid.NodeSprite("MarioSprite");
    spriteNode.addComponent(new f_.ComponentTransform(new f_.Matrix4x4()));
    spriteNode.setAnimation(animMoves);
    spriteNode.setFrameDirection(1);
    spriteNode.mtxLocal.translateY(-1);
    spriteNode.framerate = 1;

    marioTransformNode.removeAllChildren();
    marioTransformNode.appendChild(spriteNode);
    marioTransformNode.getComponent(f_.ComponentTransform).mtxLocal.scaleX(0.5);
    marioTransformNode.getComponent(f_.ComponentTransform).mtxLocal.scaleY(0.5);


    cmpCamera = viewport.camera;


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
  function moveTowards(currentN: number, targetN: number, maxDelta: number): number {
    if (Math.abs(targetN - currentN) <= maxDelta) {
      return targetN;
    }
    return currentN + Math.sign(targetN - currentN) * maxDelta;
  }


  function updateCamera(): void {
    let pos: f_.Vector3 = marioTransformNode.mtxLocal.translation;
    let origin: f_.Vector3 = cmpCamera.mtxPivot.translation;
    cmpCamera.mtxPivot.translation = new f_.Vector3(- pos.x, origin.y, origin.z);
  }

  function inAir(): void {
    onGround = false;

  }

  function checkCollision(): void {
    let pos: f_.Vector3 = marioTransformNode.mtxLocal.translation;
    for (let floor of floorNodes) {
      let posBlock: f_.Vector3 = floor.mtxLocal.translation;
      if (Math.abs(pos.x - posBlock.x) < 1) {
        if (pos.y < posBlock.y + 0.5 && pos.y > posBlock.y - 0.1) {
          pos.y = posBlock.y + 0.5;
          marioTransformNode.mtxLocal.translation = pos;
          marioVelocityY = 0;
          onGround = true;
        } else {
          onGround = false;
        }
      }
    }
  }

  let gameOver: boolean = false;

  function resetLevel(): void {
    gravity = 0;
    marioVelocityY = 0;
    gameOver = true;
    setTimeout(marioBack, 2000);
  }


  function marioBack(): void {
    cmpAudio.play(true);
    tranformComponentMario.mtxLocal.translation = new f_.Vector3(0, 1, 0);
    marioVelocityY = 0;
    //tranformComponentMario.updateMutator(marioMutator);
    gameOver = false;
    gravity = -80;
  }


  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    deltaTime = f_.Loop.timeFrameGame / 1000;

    if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.SHIFT_LEFT])) {
      currMarioSpeed = sprintSpeed;
      spriteNode.framerate = frameRtSprint;
    } else {
      currMarioSpeed = walkSpeed;
    }

    if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.SPACE]) && onGround && !hasJumped) {
      cmpAudioMario.setAudio(audioJump);
      marioVelocityY = jumpForce;
      cmpAudioMario.volume = 1;
      cmpAudioMario.play(true);
      hasJumped = true;
      inAir();
    } else if (!f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.SPACE])) {
      hasJumped = false;
    }
    // !!Old way:    distanceX = currMarioSpeed * deltaTime;

    marioVelocityY += gravity * deltaTime;
    distanceY = marioVelocityY * deltaTime;


    if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.D, f_.KEYBOARD_CODE.A])) {
      direction = (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.D]) ? 1 : -1);
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

        if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.S])) {
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


    if (f_.Keyboard.isPressedOne([f_.KEYBOARD_CODE.S])) {
      spriteNode.setAnimation(animFrames);
      spriteNode.showFrame(1);
      currentAnim = animFrames;
    }

    spriteRotation = (lastDirection == -1) ? -180 : 0;
    spriteNode.getComponent(f_.ComponentTransform).mtxLocal.rotation = new f_.Vector3(0, spriteRotation, 0);

    distanceX = marioVelocityX * deltaTime;
    tranformComponentMario.mtxLocal.translation = new f_.Vector3(tranformComponentMario.mtxLocal.translation.x + distanceX, tranformComponentMario.mtxLocal.translation.y + distanceY, tranformComponentMario.mtxLocal.translation.z);


    if (!onGround) {
      spriteNode.setAnimation(animMoves);
      currentAnim = animMoves;
      spriteNode.showFrame(1);
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
}