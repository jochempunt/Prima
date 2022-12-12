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

    public torsoNode: f.Node;


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
          this.torsoNode = this.node.getChild(0);
          window.addEventListener("mousemove", this.rotateToMousePointer);
          this.rgdBody.addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER,this.hndCollison)
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    hndCollison = ():void =>{
      console.log("collided");
    }

    moveY = (direction: number): void => {
      this.rgdBody.applyForce(new f.Vector3(0, direction * this.playerSpeed, 0))
      //this.rgdBody.applyLinearImpulse(new f.Vector3( 0,direction * 12,0));
      console.log("up " + this.playerSpeed);
    }


  

    moveX = (direction: number): void => {
      this.rgdBody.applyForce(new f.Vector3(direction * this.playerSpeed, 0, 0))

    }



    rotateToMousePointer = ( e:MouseEvent):void =>{
      let mousePosY:number = e.clientY;
      let mousePosX:number = e.clientX;

      let windowCenterX:number = window.innerWidth/2;
      let windowCenterY:number = window.innerHeight/2;

      let targetPosY:number = mousePosY - windowCenterY;
      let targetPosX: number = mousePosX - windowCenterX;

      console.log("X: " + targetPosX + " Y: "+ targetPosY );

      let angleRad:number = Math.atan2(targetPosY,targetPosX);
      

      let angleDeg:number = angleRad * (180.0 / Math.PI);

      console.log(angleDeg);

      this.torsoNode.mtxLocal.rotation = new f.Vector3(0,0,-angleDeg);
    }


    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}