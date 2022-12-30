namespace HotlineLA {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let viewport: f.Viewport;
  export let branch: f.Node;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  export let avatarCmp: CharacterMovementScript;
  export let avatarNode: f.Node;

  let enemyBranch: f.Node[];
  let enemys:Enemy[] = [];
  let enemyPositionNodes: f.Node[];
  let intialenemyTransforms:f.Matrix4x4[] = [];
  export let itemBranch:f.Node;
  
  let walls: f.Node[];

  let cmpCamera: f.ComponentCamera;
  export let gameState: GameState;

  export let BulletImage: f.TextureImage;
  export let AmmoImage: f.TextureImage;

  export let audioShot: ƒ.Audio;
  export let audioRefill: ƒ.Audio;



  function start(_event: CustomEvent): void {
    gameState = new GameState();
    viewport = _event.detail;
    branch = viewport.getBranch();

    avatarNode = branch.getChildrenByName("avatar")[0];
    avatarCmp = avatarNode.getComponent(CharacterMovementScript);

    itemBranch = branch.getChildrenByName("items")[0];
    cmpCamera = viewport.camera;


    let wallParent = branch.getChildrenByName("Walls")[0];

    walls = wallParent.getChildren();
    for (let wall of walls) {
      //collisiongroup2 is for walls // for raycasts
      wall.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_2;
    }

    loadEnemys();
   
    cmpCamera.mtxPivot.rotateY(180);
    cmpCamera.mtxPivot.translation = new f.Vector3(0, 0, 35);

    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);

    document.addEventListener("mousedown", hndClick);
    document.addEventListener("mousemove", avatarCmp.rotateToMousePointer);
    
    
    branch.addEventListener("PlayerHit",killPlayer);  
    
    let rigid = avatarNode.getComponent(f.ComponentRigidbody);
    rigid.addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER,pickupItem);  
    f.Loop.start(); 
    // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  export let bloodSprite: f.TextureImage;




  function pickupItem(event:f.EventPhysics){
  console.log("why isnt it possible?");
    if(event.cmpRigidbody.node.name == "ammo"){
      avatarCmp.cmpAudio.setAudio(audioRefill);
      avatarCmp.cmpAudio.play(true);
      avatarCmp.reloadBullets(1);
  
      let node: f.Node =event.cmpRigidbody.node;
      setTimeout(removeItem.bind(this,node),1);
      
    }
  }
  function removeItem(node:f.Node){
    itemBranch.removeChild(node);
  }

  function killPlayer():void{
    avatarCmp.die();
    setTimeout(ResetLevel,1000);
  }

  async function loadEnemys(): Promise<void> {
    
    
    let imgSpriteSheetWalk: f.TextureImage = new f.TextureImage();
    await imgSpriteSheetWalk.load("./Images/EnemySprites/EnemyArmed.png");

    let imgSpriteSheehtShotDead: f.TextureImage = new f.TextureImage();
    await imgSpriteSheehtShotDead.load("./Images/EnemySprites/EnemyDeath1.png");


    let imgSpriteSheehtShotDeadF: f.TextureImage = new f.TextureImage();
    await imgSpriteSheehtShotDeadF.load("./Images/EnemySprites/EnemyDeadFront.png");

    bloodSprite = new f.TextureImage();
    await bloodSprite.load("./Images/EnemySprites/BloodPuddle.png");

    BulletImage = new f.TextureImage();
    await BulletImage.load("./Images/FX/CharacterBullet.png");

    AmmoImage = new f.TextureImage();
    await AmmoImage.load("./Images/avatarSprites/ammo.png")

    let avatarShootSprite = new f.TextureImage();
    await avatarShootSprite.load("./Images/avatarSprites/shootAnimation.png");
   

    let avatarDeathShotSprite = new f.TextureImage();
    await avatarDeathShotSprite.load("./Images/avatarSprites/deathShotA.png");
    avatarCmp.initialiseAnimations(avatarShootSprite,avatarDeathShotSprite);
    gameState.bulletCount = avatarCmp.bulletCount;
    showVui();
    
    
    enemyBranch = branch.getChildrenByName("Enemys");
    enemyPositionNodes= enemyBranch[0].getChildrenByName("EnemyPos");
    for(let enemyP of enemyPositionNodes){
      intialenemyTransforms.push(enemyP.mtxLocal.clone);
      enemyP.removeComponent(enemyP.getComponent(f.ComponentMesh));
      let enemyNode: Enemy = new Enemy();
      enemyNode.initializeAnimations(imgSpriteSheetWalk, imgSpriteSheehtShotDead, imgSpriteSheehtShotDeadF);
      enemys.push(enemyNode);
      enemyP.appendChild(enemyNode);
    }

    audioShot = new f.Audio();
    await audioShot.load("./Sounds/9mmshot.mp3");
  
    audioRefill = new f.Audio();
    await audioRefill.load("./Sounds/ammoRefill.mp3");
   



  }






  function updateCamera(): void {
    cmpCamera.mtxPivot.translation = new f.Vector3(avatarNode.mtxLocal.translation.x, avatarNode.mtxLocal.translation.y, cmpCamera.mtxPivot.translation.z);
  }
  function hndClick(event: Event): void {
    //avatarCmp.shootBullet();
    avatarCmp.shootBulletsR();
  }

  function showVui(){
    document.getElementById("vui").className = "";
  }


  function resetEnemyPositions(){
    for( let i: number = 0; i< enemyPositionNodes.length;i++){
      enemyPositionNodes[i].mtxLocal.set(intialenemyTransforms[i]);
    }
  }


  function ResetLevel():void{
    avatarCmp.dead = false;
    enemys.forEach(enemy => {
      enemy.reset();
    });
    resetEnemyPositions();
    avatarCmp.reset();
    itemBranch.removeAllChildren();
  }

 



  function update(_event: Event): void {
    gameState.bulletCount = avatarCmp.bulletCount;
    f.Physics.settings.solverIterations = 5000;
    f.Physics.simulate();  // if physics is included and used
    viewport.draw();
    f.AudioManager.default.update();
    //f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
    //viewport.physicsDebugMode = 2;
   


      
 

    if (!avatarCmp.dead) {
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
      if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.L])) {
        avatarCmp.die();
      }
    }



    updateCamera();


  }
}