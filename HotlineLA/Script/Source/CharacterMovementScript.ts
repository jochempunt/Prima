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

    private playerSpeed: number = 100;

    private rgdBody: f.ComponentRigidbody;

    private torsoNode: f.Node;
    private gunNode: f.Node;

    private targetX: number;
    private targetY: number;

    private bulletSpeed: number = 20;

    private shootAgain: boolean = true;

    private bulletCount:number = 0;


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
          this.rgdBody.collisionMask =f.COLLISION_GROUP.GROUP_2;
          this.torsoNode = this.node.getChild(0);
          this.gunNode = this.torsoNode.getChild(0);
          window.addEventListener("mousemove", this.rotateToMousePointer);
          //this.rgdBody.addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, this.hndCollison);
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    hndBulletHit = (event:Event): void => {
      //  console.log("collided");
      //console.log(event);
    }




    moveY = (direction: number): void => {
      this.rgdBody.applyForce(new f.Vector3(0, direction * this.playerSpeed, 0))
      //this.rgdBody.applyLinearImpulse(new f.Vector3( 0,direction * 12,0));
      //console.log("up " + this.playerSpeed);
    }




    moveX = (direction: number): void => {
      this.rgdBody.applyForce(new f.Vector3(direction * this.playerSpeed, 0, 0))
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
      bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse(f.Vector3.NORMALIZATION(new f.Vector3(this.targetX - this.gunNode.mtxWorld.translation.x, -(this.targetY - this.gunNode.mtxWorld.translation.y), 1), this.bulletSpeed));
      //bullet.getComponent(f.ComponentRigidbody).applyLinearImpulse( f.Vector3.NORMALIZATION( new f.Vector3(this.targetX ,-this.targetY,0),this.bulletSpeed));
      this.shootAgain = false;
      let time: f.Time = new f.Time();
      let timer: f.Timer = new f.Timer(time, 150, 1, this.hndTime);

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