namespace HotlineLA {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let viewport: f.Viewport;
  export let branch:f.Node;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let avatarCmp: CharacterMovementScript;
  let avatarNode: f.Node; 

  

  let cmpCamera: f.ComponentCamera;

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    branch = viewport.getBranch();

    avatarNode = branch.getChildrenByName("avatar")[0];
    avatarCmp = avatarNode.getComponent(CharacterMovementScript);

    cmpCamera = viewport.camera;

    cmpCamera.mtxPivot.translation = new f.Vector3(0,0,-15);

    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);

 
    f.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function updateCamera():void{
    cmpCamera.mtxPivot.translation = new f.Vector3(-avatarNode.mtxLocal.translation.x,avatarNode.mtxLocal.translation.y,cmpCamera.mtxPivot.translation.z);
  }



  function update(_event: Event): void {
    f.Physics.simulate();  // if physics is included and used
    viewport.draw();
    f.AudioManager.default.update();



    if(f.Keyboard.isPressedOne([f.KEYBOARD_CODE.B])){
      avatarCmp.shootBullet();
    }
    if(f.Keyboard.isPressedOne([f.KEYBOARD_CODE.W, f.KEYBOARD_CODE.ARROW_UP])){
      avatarCmp.moveY(1);
    }
    if(f.Keyboard.isPressedOne([f.KEYBOARD_CODE.S,f.KEYBOARD_CODE.ARROW_DOWN])){
      avatarCmp.moveY(-1);
    }
    if(f.Keyboard.isPressedOne([f.KEYBOARD_CODE.D,f.KEYBOARD_CODE.ARROW_RIGHT])){
      avatarCmp.moveX(1);
    }
    if(f.Keyboard.isPressedOne([f.KEYBOARD_CODE.A,f.KEYBOARD_CODE.ARROW_LEFT])){
      avatarCmp.moveX(-1);
    }
    
    updateCamera();


  }
}