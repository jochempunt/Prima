namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let marioTransformNode: ƒ.Node;
  let spriteNode: ƒAid.NodeSprite;

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
  let currentAnim:ƒAid.SpriteSheetAnimation = undefined;

  let onGround: boolean = true;
  let spriteRotation = 0;
  let direction: number = 1;

  let currMarioSpeed = 0.0;
  let marioVelocityX: number = 0;
  let marioVelocityY: number = 0;
  let distanceX: number = 0;
  let distanceY: number = 0;
  let deltaTime = 0;






  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);



    let branch: ƒ.Node = viewport.getBranch();
    marioTransformNode = branch.getChildrenByName("MarioTransform")[0];

    hndLoad();
  }

  let animFrames: ƒAid.SpriteSheetAnimation = undefined;
  let animWalk: ƒAid.SpriteSheetAnimation = undefined;
  let animMoves: ƒAid.SpriteSheetAnimation = undefined;

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

    //root.addChild(spriteNode);



    // setup viewport
    marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.scaleX(0.5);
    marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.scaleY(0.5);

    //viewport.draw();

    //ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME);

    //document.forms[0].addEventListener("change", handleChange);
  }











  // function inspired by unitys "mathf.MoveTowards()" function
  function moveTowards(currentN: number, targetN: number, maxDelta: number): number {
    if (Math.abs(targetN - currentN) <= maxDelta) {
      return targetN;
    }
    return currentN + Math.sign(targetN - currentN) * maxDelta;

  }

  let lastDirection: number = 0;

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    let tranformComponentMario = marioTransformNode.getComponent(ƒ.ComponentTransform);
    deltaTime = ƒ.Loop.timeFrameGame / 1000;

    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT])) {
      currMarioSpeed = sprintSpeed;
      spriteNode.framerate = frameRtSprint;
    } else {
      currMarioSpeed = walkSpeed
      // spriteNode.framerate = frameRtWalk;
    }


    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE]) && onGround) {
      marioVelocityY = jumpForce;
      
    }
    //distanceX = currMarioSpeed * deltaTime;

    marioVelocityY += gravity * deltaTime;
    distanceY = marioVelocityY * deltaTime;

    





    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.A])) {
      
      direction = (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D]) ? 1 : -1);
      console.log("direction:" + direction);
      lastDirection = Number(direction);
      if (currentAnim != animWalk){
        spriteNode.setAnimation(animWalk);
        spriteNode.framerate = frameRtWalk;
        currentAnim = animWalk;
      }
      if (onGround) {
        marioVelocityX = moveTowards(marioVelocityX, direction * currMarioSpeed, marioAccellartionX * currMarioSpeed * deltaTime);
        if(Math.sign(marioVelocityX) !=Math.sign(direction)||(marioVelocityX ==0)){
          spriteNode.setAnimation(animMoves);
          spriteNode.showFrame(0);
          currentAnim = animMoves;
        }
      } else {
        marioVelocityX = moveTowards(marioVelocityX, 0.9 * direction * currMarioSpeed, 0);
      }
    } else {
      if(onGround){
        spriteNode.setAnimation(animFrames);
        currentAnim = animFrames;
        spriteNode.showFrame(0);
      }
      direction = 0;
      marioVelocityX = moveTowards(marioVelocityX, direction * currMarioSpeed, marioDeccellerationX * currMarioSpeed * deltaTime);
    }
    console.log("lastiDirection =" + lastDirection)
    spriteRotation = (lastDirection == -1) ? -180 : 0;
    spriteNode.getComponent(ƒ.ComponentTransform).mtxLocal.rotation = new ƒ.Vector3(0, spriteRotation, 0);

    distanceX = marioVelocityX * deltaTime;

    tranformComponentMario.mtxLocal.translation = new ƒ.Vector3(tranformComponentMario.mtxLocal.translation.x + distanceX, tranformComponentMario.mtxLocal.translation.y + distanceY, tranformComponentMario.mtxLocal.translation.z)

    //tranformComponentMario.mtxLocal.translateX(distanceX);
    //tranformComponentMario.mtxLocal.translateY(distanceY);
    //mutatoren
    
    if (tranformComponentMario.mtxLocal.translation.y <= -0.7) {
      tranformComponentMario.mtxLocal.translation = new ƒ.Vector3(tranformComponentMario.mtxLocal.translation.x, -0.7, tranformComponentMario.mtxLocal.translation.z);
      onGround = true;
    } else {
      onGround = false;
      spriteNode.setAnimation(animMoves);
      currentAnim = animMoves;
      spriteNode.showFrame(1);
   
    }

    viewport.draw();


    ƒ.AudioManager.default.update();
  }
}