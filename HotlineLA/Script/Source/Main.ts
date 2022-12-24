namespace HotlineLA {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let viewport: f.Viewport;
  export let branch: f.Node;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let avatarCmp: CharacterMovementScript;
  let avatarNode: f.Node;

  let enemys: f.Node[];
  let enemyPos: f.Node
  let walls: f.Node[];

  let cmpCamera: f.ComponentCamera;

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    branch = viewport.getBranch();

    avatarNode = branch.getChildrenByName("avatar")[0];
    avatarCmp = avatarNode.getComponent(CharacterMovementScript);

    cmpCamera = viewport.camera;


    let wallParent = branch.getChildrenByName("Walls")[0];

    walls = wallParent.getChildren();
    for(let wall of walls){
      //collisiongroup2 is for walls // for raycasts
      wall.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_2;
    }

    loadEnemys();


    cmpCamera.mtxPivot.translation = new f.Vector3(0, 0, -35);

    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    branch.addEventListener("BulletHit", hndBulletHit);

    f.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }



  async function loadEnemys(): Promise<void> {
    enemys = branch.getChildrenByName("Enemys");
    enemyPos = enemys[0].getChildrenByName("EnemyPos")[0];
    enemyPos.removeComponent(enemyPos.getComponent(f.ComponentMesh));
    let enemyNode:Enemy = new Enemy();
    
    let imgSpriteSheetWalk: f.TextureImage = new f.TextureImage();
    await imgSpriteSheetWalk.load("./Images/EnemySprites/EnemyArmed.png");

    let imgSpriteSheehtShotDead: f.TextureImage = new f.TextureImage();
    await imgSpriteSheehtShotDead.load("./Images/EnemySprites/EnemyDeath1.png");


    let imgSpriteSheehtShotDeadF: f.TextureImage = new f.TextureImage();
    await imgSpriteSheehtShotDeadF.load("./Images/EnemySprites/EnemyDeadFront.png");

    enemyNode.initializeAnimations(imgSpriteSheetWalk,imgSpriteSheehtShotDead,imgSpriteSheehtShotDeadF);
    enemyPos.appendChild(enemyNode);

  }

  let bulletToRemove: f.Node;
  function hndBulletHit(event: f.EventUnified): void {
    //  console.log("collided");
    bulletToRemove = <f.Node>event.target;
    //console.log(bulletToRemove.name);
    //bulletToRemove.removeComponent(bulletToRemove.getComponent(BulletScript));

    setTimeout(removeBullet, 1);

  }



  function removeBullet() {
    branch.removeChild(bulletToRemove);
  }



  function updateCamera(): void {
    cmpCamera.mtxPivot.translation = new f.Vector3(-avatarNode.mtxLocal.translation.x, avatarNode.mtxLocal.translation.y, cmpCamera.mtxPivot.translation.z);
  }



  function update(_event: Event): void {
    f.Physics.settings.solverIterations = 5000;
    f.Physics.simulate();  // if physics is included and used
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
}