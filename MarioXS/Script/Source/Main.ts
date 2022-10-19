namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let marioTransformNode: ƒ.Node;
  let marioNode: ƒ.Node;
  let spriteNode: ƒAid.NodeSprite;

  let marioSpeed = 0.0;
  let walkSpeed:number = 3.0;
  let sprintSpeed: number = 10;

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    //ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a




    let branch: ƒ.Node = viewport.getBranch();
    marioTransformNode = branch.getChildrenByName("MarioTransform")[0];

    marioNode = marioTransformNode.getChildrenByName("Mario")[0];

    hndLoad();


  }


  async function hndLoad(): Promise<void> {
    //let root: ƒ.Node = new ƒ.Node("root");
    let imgSpriteSheet: ƒ.TextureImage;
    try {
      imgSpriteSheet = new ƒ.TextureImage();
      await imgSpriteSheet.load("./Images/mario_walk2.png");
    } catch (e: any) {
      console.log(e);
    }
  

  let coat: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheet);
  console.log(coat);
  let animation: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("Walk", coat);
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





let directionRight: boolean = true;


let distance : number =0;
function update(_event: Event): void {
  // ƒ.Physics.simulate();  // if physics is included and used
  
  console.log("update");
  console.log(ƒ.Loop.timeFrameGame);

  if(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT])){
    marioSpeed = sprintSpeed;
  }else{
    marioSpeed = walkSpeed
  }
  distance = marioSpeed/1000 * ƒ.Loop.timeFrameGame;

  console.log(marioSpeed);
  if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
    marioTransformNode.getComponent(ƒ.ComponentTransform).mtxLocal.translateX(distance);
    if (!directionRight) {
      spriteNode.getComponent(ƒ.ComponentTransform).mtxLocal.rotateY(180);
      directionRight = true;
    }
  } else if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {

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
}