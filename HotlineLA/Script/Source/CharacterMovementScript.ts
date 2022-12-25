namespace HotlineLA {
  import f = FudgeCore;
  f.Project.registerScriptNamespace(HotlineLA);  // Register the namespace to FUDGE for serialization

  export class CharacterMovementScript extends f.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = f.Component.registerSubclass(CharacterMovementScript);
    // Properties may be mutated by users in the editor via the automatically created user interface



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

    private BULLETSPEED: number = 20;

    private shootAgain: boolean = true;

    private bulletCount: number = 10; 
    private MAX_BULLETS: number = 10; 

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
          this.rgdBody = this.node.getComponent(f.ComponentRigidbody);
          this.rgdBody.effectRotation.x = 0;
          this.rgdBody.effectRotation.y = 0;
          this.rgdBody.collisionMask = f.COLLISION_GROUP.GROUP_2;
          this.torsoNode = this.node.getChild(0);
          this.gunNode = this.torsoNode.getChild(0);
         
          //this.rgdBody.addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, this.hndCollison);
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    hndBulletHit = (event: Event): void => {
      //  console.log("collided");
      //console.log(event);
    }




    moveY = (direction: number): void => {
      this.rgdBody.applyForce(new f.Vector3(0, direction * this.PLAYER_SPEED, 0))
      //this.rgdBody.applyLinearImpulse(new f.Vector3( 0,direction * 12,0));
      //console.log("up " + this.playerSpeed);
    }




    moveX = (direction: number): void => {
      this.rgdBody.applyForce(new f.Vector3(direction * this.PLAYER_SPEED, 0, 0))
    }



    rotateToMousePointer = (e: MouseEvent): void => {
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


    shootBullet = (): void => {
      if (!this.shootAgain) {
        return;
      }
      let bullet: f.Node = new BulletNode(this.gunNode)
      branch.addChild(bullet);

      this.bulletCount++;
      // TODO: make the bullet precisely go from the initial position to the target point 
      bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse(f.Vector3.NORMALIZATION(new f.Vector3(this.targetX - this.gunNode.mtxWorld.translation.x, -(this.targetY - this.gunNode.mtxWorld.translation.y), 1), this.BULLETSPEED));
      //bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse( f.Vector3.NORMALIZATION( new f.Vector3(this.targetX ,-this.targetY,0),this.bulletSpeed));
      this.shootAgain = false;
      let time: f.Time = new f.Time();
      let timer: f.Timer = new f.Timer(time, 150, 1, this.hndTime);

    }

    shootBulletsR = (): void =>{

      if (!this.shootAgain || this.bulletCount <= 0) {
        return;
      }
      //let bullet: f.Node = new BulletNode(this.gunNode)
      //branch.addChild(bullet);

      this.bulletCount--;
      // TODO: make the bullet precisely go from the initial position to the target point 



      // Cast a ray from the starting position of the bullet to the target position
      let startPos: f.Vector3 = this.gunNode.mtxWorld.translation;
      let endPos: f.Vector3 = new f.Vector3(this.targetX, -this.targetY, 0);
      let direction: f.Vector3 = f.Vector3.DIFFERENCE(endPos, startPos);
      let maxDistance: number = this.BULLETSPEED * 0.1; // Set the maximum distance of the raycast based on the bullet speed
      let raycast: f.RayHitInfo = f.Physics.raycast(startPos, direction, maxDistance);

      // If the ray intersects with an object, apply appropriate effects
      if (raycast.hit) {
        // Apply damage or destruction to the object that was hit
      }



      this.shootAgain = false;
      let time: f.Time = new f.Time();
      let timer: f.Timer = new f.Timer(time, 150, 1, this.hndTime);

    
  }


  reloadBullets = (bulletsToReload: number): void => {
    this.bulletCount += bulletsToReload; // Increment bulletCount by the number of bullets being reloaded
  }



  hndTime = (): void => {
    this.shootAgain = true;
  }


  // protected reduceMutator(_mutator: ƒ.Mutator): void {
  //   // delete properties that should not be mutated
  //   // undefined properties and private fields (#) will not be included by default
  // }
}
}