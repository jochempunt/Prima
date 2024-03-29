namespace HotlineLA {
  import f = FudgeCore;
  f.Project.registerScriptNamespace(HotlineLA);  // Register the namespace to FUDGE for serialization

  export class CharacterMovementScript extends f.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = f.Component.registerSubclass(CharacterMovementScript);
    // Properties may be mutated by users in the editor via the automatically created user interface

    private avatarSprites: AvatarSpriteNode;
    private initialtransform: f.Matrix4x4;

    constructor() {
      super();
  
      // Don't start when running in editor
      if (f.Project.mode == f.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(f.EVENT.NODE_DESERIALIZED, this.hndEvent);


    }

    private PLAYER_SPEED: number = 200;

    private rgdBody: f.ComponentRigidbody;

    private torsoNode: f.Node;
    private gunNode: f.Node;

    private targetX: number;
    private targetY: number;


    private shootAgain: boolean = true;

    public bulletCount: number;
    private INIT_BULLETS: number = 10;

    public dead: boolean;
    public cmpListener: ƒ.ComponentAudioListener;
    public cmpAudio: f.ComponentAudio;

    initParams(_playerSpeed:number,_numberOfBulletsStarting:number){
      this.PLAYER_SPEED = _playerSpeed;
      this.INIT_BULLETS = _numberOfBulletsStarting;
      this.bulletCount = this.INIT_BULLETS;
      gameState.bulletCount = this.bulletCount;
    }

    initialiseAnimations(shootingImg: f.TextureImage, deathImg: f.TextureImage): void {
      this.avatarSprites.initaliseAnimations(shootingImg, deathImg);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case f.EVENT.COMPONENT_ADD:
          break;
        case f.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case f.EVENT.NODE_DESERIALIZED:
          this.setup();
         
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    setup = (): void => {
      this.initialtransform = this.node.mtxLocal.clone;
      this.rgdBody = this.node.getComponent(f.ComponentRigidbody);
      this.rgdBody.effectRotation.x = 0;
      this.rgdBody.effectRotation.y = 0;
      this.rgdBody.collisionGroup = f.COLLISION_GROUP.GROUP_2;
      //this.rgdBody.collisionMask = f.COLLISION_GROUP.GROUP_2;
      this.torsoNode = this.node.getChild(0);
      this.gunNode = this.torsoNode.getChild(0);
      
      this.avatarSprites = new AvatarSpriteNode();
      this.torsoNode.removeComponent(this.torsoNode.getComponent(f.ComponentMaterial));
      this.torsoNode.addChild(this.avatarSprites);
      this.dead = false;
      this.cmpListener = new ƒ.ComponentAudioListener();
      this.node.addComponent(this.cmpListener);
      ƒ.AudioManager.default.listenWith(this.cmpListener);
      this.cmpAudio = new ƒ.ComponentAudio(audioShot);
      this.cmpAudio.volume = 0.25;
      this.node.addComponent(this.cmpAudio);
    }


    moveY = (direction: number): void => {
      this.rgdBody.applyForce(new f.Vector3(0, direction * this.PLAYER_SPEED, 0))
    }

    die() {
      this.avatarSprites.mtxLocal.translateZ(-0.01);
      this.avatarSprites.setDeathSprite();
      this.rgdBody.activate(false);
      this.dead = true;
    }


    moveX = (direction: number): void => {
      this.rgdBody.applyForce(new f.Vector3(direction * this.PLAYER_SPEED, 0, 0))
    }
    rotateToMousePointer = (e: MouseEvent): void => {
      if (!this.dead) {
        let mousePosY: number = e.clientY;
        let mousePosX: number = e.clientX;
        let windowCenterX: number = window.innerWidth / 2;
        let windowCenterY: number = window.innerHeight / 2;
        this.targetY = mousePosY - windowCenterY;
        this.targetX = mousePosX - windowCenterX;
        let angleRad: number = Math.atan2(this.targetY, this.targetX);
        let angleDeg: number = angleRad * (180.0 / Math.PI);
        this.torsoNode.mtxLocal.rotation = new f.Vector3(0, 0, -angleDeg);
      }

    }

    shootBulletsR = (): void => {

      if (!this.shootAgain || this.bulletCount <= 0 || this.dead) {
        return;
      }
      this.bulletCount--;
      
      // Cast a ray from the starting position of the bullet to the target position
      let startPos: f.Vector3 = this.gunNode.mtxWorld.translation;
      let endPos: f.Vector3 = new f.Vector3(this.targetX, -this.targetY, 0);
      let direction: f.Vector3 = f.Vector3.DIFFERENCE(endPos, startPos);
      let raycast: f.RayHitInfo = f.Physics.raycast(startPos, direction, 30);

      if (raycast.hit) {
        console.log(raycast.hitPoint);
        this.avatarSprites.shootAnim();
      
        branch.addChild(new BulletNode(this.gunNode, raycast));

        avatarCmp.cmpAudio.setAudio(audioShot);
        avatarCmp.cmpAudio.play(true);
        this.cmpAudio.play(true);

     
        if (raycast.rigidbodyComponent.node.name.includes("Enemy")) {
          console.log("hit enemy");

          let enemy: Enemy = raycast.rigidbodyComponent.node.getChildrenByName("enemy")[0] as Enemy;
          raycast.hitNormal.normalize();
          enemy.getComponent(enemyStateMachine).hndShotDead(direction);
        }
      }
      this.shootAgain = false;
      let time: f.Time = new f.Time();
      new f.Timer(time, 150, 1, this.enableShooting);

    }


    reloadBullets = (bulletsToReload: number): void => {
      this.bulletCount += bulletsToReload; // Increment bulletCount by the number of bullets being reloaded
    }



    enableShooting = (): void => {
      this.shootAgain = true;
    }
    reset(): void {

      this.node.getParent().getComponent(f.ComponentRigidbody);
      this.node.mtxLocal.set(this.initialtransform);
      this.rgdBody.setVelocity(f.Vector3.ZERO());
      this.rgdBody.activate(true);


      this.bulletCount = this.INIT_BULLETS;
      this.shootAgain = true;
      this.dead = false;

      this.avatarSprites.reset();

      if (gameState) {
        gameState.bulletCount = this.bulletCount;
      }


      // protected reduceMutator(_mutator: ƒ.Mutator): void {
      //   // delete properties that should not be mutated
      //   // undefined properties and private fields (#) will not be included by default
      // }
    }
  }
}