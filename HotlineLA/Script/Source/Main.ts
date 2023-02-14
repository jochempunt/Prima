namespace HotlineLA {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let viewport: f.Viewport;
  export let branch: f.Node;

  export let avatarCmp: CharacterMovementScript;
  export let avatarNode: f.Node;
  let enemyBranch: f.Node[];
  let enemys: Enemy[] = [];
  let enemysKilled: number = 0;
  let enemyPositionNodes: f.Node[];
  let intialenemyTransforms: f.Matrix4x4[] = [];
  export let itemBranch: f.Node;
  let walls: f.Node[];

  let cmpCamera: f.ComponentCamera;
  export let gameState: GameState;

  export let BulletImage: f.TextureImage;
  export let AmmoImage: f.TextureImage;
  export let bloodSprite: f.TextureImage;

  export let audioShot: ƒ.Audio;
  export let audioRefill: ƒ.Audio;
  let cmpAudioSong: f.ComponentAudio;
  let endsong: f.Audio;
  let backgroundSong: f.Audio;

  let activePoints: Point[] = [];
  let lastTimeKill: number;

  let extParameters: XData;

  const dataFileCount: number = 10;
  let progress: number;
  let progressDiv: HTMLDivElement;
  let loadingText:HTMLDivElement;
  let progressBar: HTMLDivElement;

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    loadingText = document.querySelector('#loadingText');
    loadingText.classList.remove("hidden");
    progressDiv = document.querySelector('.progress-bar');
    progressDiv.classList.remove("hidden");
    progressBar = document.querySelector('.progress-bar .progress')
    progress = 0;
    gameState = new GameState();
    viewport = _event.detail;
    branch = viewport.getBranch();
    setup(_event);
  }



  interface XData {
    avatarSpeed: number,
    enemyPatrollSpeed: number,
    enemyChaseSpeed: number,
    enemyReloadSpeed: number,
    enemyFOV: number,
    enemyShotRange: number,
    startingBulletAmount: number
  }



  async function fetchXData(_path: string): Promise<XData> {
    let response: Response = await fetch(_path);
    let data: XData = await response.json();
    return data;
  }


  async function setup(_event: CustomEvent): Promise<void> {
    avatarNode = branch.getChildrenByName("avatar")[0];
    avatarCmp = avatarNode.getComponent(CharacterMovementScript);
    itemBranch = branch.getChildrenByName("items")[0];
    cmpCamera = viewport.camera;
    let wallParent = branch.getChildrenByName("Walls")[0];
    walls = wallParent.getChildren();
    for (let wall of walls) {
      wall.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_2;
    }
    extParameters = await fetchXData("./ExternalData.json");
    avatarCmp.initParams(extParameters.avatarSpeed,extParameters.startingBulletAmount);
    await loadData();
    progressDiv.classList.add("hidden");
    loadingText.classList.add("hidden");
    cmpCamera.mtxPivot.rotateY(180);
    cmpCamera.mtxPivot.translation = new f.Vector3(0, 0, 40);
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    document.addEventListener("mousedown", hndClick);
    document.addEventListener("mousemove", avatarCmp.rotateToMousePointer);
    branch.addEventListener("PlayerHit", killPlayer);
    branch.addEventListener("shotEnemy", hndEnemyKilled);
    let rigid = avatarNode.getComponent(f.ComponentRigidbody);
    rigid.addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, pickupItem);
    f.Loop.start();
    // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }


  function updateProgress(): void {
    progress++;
    let percentage = (100 / dataFileCount) * progress;
    progressBar.style.width = percentage + '%';
  }

  function viewEndNote() {
    document.getElementById("endText").classList.remove("hidden");
  }

  function hndEnemyKilled(event: Event) {
    let enemy: Enemy = event.target as Enemy;
    let enemyPos: f.Vector3 = enemy.mtxWorld.translation;
    console.log(enemyPos);
    let points: number = 400;
    let newPos: f.Vector2 = viewport.pointWorldToClient(enemyPos);
    console.log("x: " + newPos.x + "px y: " + newPos.y + "px");
    let pointText: HTMLDivElement = document.createElement("div");
    let now: number = Date.now();
    if (lastTimeKill) {
      let elapsedTimeInSeconds: number = (now - lastTimeKill) / 1000;
      if (elapsedTimeInSeconds <= 3) {
        gameState.multiplier++;
      }
    }
    lastTimeKill = now;
    pointText.textContent = points * gameState.multiplier + "";
    pointText.className = "pointPop"
    pointText.style.position = "absolute";
    pointText.style.left = newPos.x + "px";
    pointText.style.top = newPos.y - 40 + "px";
    document.body.appendChild(pointText);
    let p: Point = new Point(enemyPos, pointText);
    activePoints.push(p);
    new f.Timer(new f.Time, 1000, 1, deleteLastPoint.bind(this, p));
    gameState.points = gameState.points + (points * gameState.multiplier);

    enemysKilled++;
    if (enemysKilled == enemys.length) {
      finish();
    }
  }

  function finish(){
    console.log("finished the level");
    cmpAudioSong.setAudio(endsong);
    cmpAudioSong.volume = 1;
    cmpAudioSong.play(true);

    let canvas: HTMLCanvasElement = viewport.canvas;
    canvas.classList.add("hue");
    document.getElementById("clearLevelHeading").classList.remove("hidden");
    setTimeout(viewEndNote, 300);
    for(let enemyPos of enemyPositionNodes){
      enemyPos.removeComponent(enemyPos.getComponent(f.ComponentRigidbody));
    }
  }


  function updateMultiplier() {
    let now: number = Date.now();
    if (lastTimeKill) {
      let elapsedTimeInSeconds: number = (now - lastTimeKill) / 1000;
      if (elapsedTimeInSeconds > 3) {
        gameState.multiplier = 1;
      }
    }
  }

  function deleteLastPoint(point: Point): void {
    activePoints.slice(activePoints.indexOf(point), 1)
    document.body.removeChild(point.divElement);
  }

  function updatePointPositions() {
    for (let p of activePoints) {
      if (p) {
        let newPos: f.Vector2 = viewport.pointWorldToClient(p.gameCoordinates);
        p.divElement.style.left = newPos.x + "px";
        p.divElement.style.top = newPos.y - 40 + "px";
      }
    }
  }

  function pickupItem(event: f.EventPhysics) {
    if (event.cmpRigidbody.node.name == "ammo") {
      avatarCmp.cmpAudio.setAudio(audioRefill);
      avatarCmp.cmpAudio.play(true);
      avatarCmp.reloadBullets(1);
      let node: f.Node = event.cmpRigidbody.node;
      setTimeout(removeItem.bind(this, node), 1);
    }
  }
  function removeItem(node: f.Node) {
    itemBranch.removeChild(node);
  }

  function killPlayer(): void {
    avatarCmp.dead = true;
    avatarCmp.die();
    setTimeout(ResetLevel, 1000);
  }

  async function loadData(): Promise<void> {
    let imgSpriteSheetWalk: f.TextureImage = new f.TextureImage();
    await imgSpriteSheetWalk.load("./Images/EnemySprites/EnemyArmed.png");
    updateProgress();
    let imgSpriteSheehtShotDead: f.TextureImage = new f.TextureImage();
    await imgSpriteSheehtShotDead.load("./Images/EnemySprites/EnemyDeath1.png");
    updateProgress();
    let imgSpriteSheehtShotDeadF: f.TextureImage = new f.TextureImage();
    await imgSpriteSheehtShotDeadF.load("./Images/EnemySprites/EnemyDeadFront.png");
    updateProgress();
    bloodSprite = new f.TextureImage();
    await bloodSprite.load("./Images/EnemySprites/BloodPuddle.png");
    updateProgress();
    BulletImage = new f.TextureImage();
    await BulletImage.load("./Images/FX/CharacterBullet.png");
    updateProgress();
    AmmoImage = new f.TextureImage();
    await AmmoImage.load("./Images/avatarSprites/ammo.png")
    updateProgress();
    let avatarShootSprite = new f.TextureImage();
    await avatarShootSprite.load("./Images/avatarSprites/shootAnimation.png");
    updateProgress();
    backgroundSong = new f.Audio();
    await backgroundSong.load("./Sounds/KLOUD-PRIMAL.mp3");
    updateProgress();
    endsong = new f.Audio("");
    await endsong.load("./Sounds/you_dont_even_smile_anymore.mp3");
    updateProgress();
    cmpAudioSong = new f.ComponentAudio(backgroundSong);
    avatarNode.addComponent(cmpAudioSong);
    cmpAudioSong.volume = 0.3;
    cmpAudioSong.play(true);
    let avatarDeathShotSprite = new f.TextureImage();
    await avatarDeathShotSprite.load("./Images/avatarSprites/deathShotA.png");
    updateProgress();
    avatarCmp.initialiseAnimations(avatarShootSprite, avatarDeathShotSprite);
    gameState.bulletCount = avatarCmp.bulletCount;
    gameState.points = 0;
    gameState.multiplier = 1;
    showVui();
    //load enemys
    enemyBranch = branch.getChildrenByName("Enemys");
    enemyPositionNodes = enemyBranch[0].getChildrenByName("EnemyPos");
    for (let enemyP of enemyPositionNodes) {
      intialenemyTransforms.push(enemyP.mtxLocal.clone);
      enemyP.removeComponent(enemyP.getComponent(f.ComponentMesh));
      let enemyRgdBody: f.ComponentRigidbody = enemyP.getComponent(f.ComponentRigidbody);
      enemyRgdBody.effectRotation.x = 0;
      enemyRgdBody.effectRotation.y = 0;
      let enemyNode: Enemy = new Enemy(extParameters.enemyPatrollSpeed, extParameters.enemyChaseSpeed, extParameters.enemyReloadSpeed, extParameters.enemyFOV, extParameters.enemyShotRange);
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
    avatarCmp.shootBulletsR();
  }

  function showVui() {
    document.getElementById("vui").className = "";
  }

  function resetEnemyPositions() {
    for (let i: number = 0; i < enemyPositionNodes.length; i++) {
      //enemyPositionNodes[i].getComponent(f.ComponentRigidbody).activate(false);
      enemyPositionNodes[i].mtxLocal.set(intialenemyTransforms[i]);
      enemyPositionNodes[i].getComponent(f.ComponentRigidbody).activate(true);
    }
  }

  function ResetLevel(): void {
    avatarCmp.dead = false;
    enemysKilled = 0;
    enemys.forEach(enemy => {
      enemy.reset();
    });
    resetEnemyPositions();
    avatarCmp.reset();
    itemBranch.removeAllChildren();
    gameState.points = 0;
  }

  function update(_event: Event): void {
    gameState.bulletCount = avatarCmp.bulletCount;
    f.Physics.settings.solverIterations = 5000;
    f.Physics.simulate();
    viewport.draw();
    f.AudioManager.default.update();
    f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
    //viewport.physicsDebugMode = 2;
    updatePointPositions();
    updateMultiplier();

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
    }
    updateCamera();
  }
}