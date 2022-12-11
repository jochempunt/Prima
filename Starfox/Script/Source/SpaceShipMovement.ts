namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class SpaceShipMovement extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(SpaceShipMovement);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "SpaceShipMovement added to ";
    

    private rgdBodySpaceship: ƒ.ComponentRigidbody;

    public strafeThrust: number = 2000;
    public forwardthrust: number = 5000;



    private relativeX: ƒ.Vector3;
    private relativeY: ƒ.Vector3;
    private relativeZ: ƒ.Vector3;


    private audioCrash: ƒ.Audio;

    

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Debug.log(this.message, this.node);
          this.rgdBodySpaceship = this.node.getComponent(ƒ.ComponentRigidbody);
          // this.rgdBodySpaceship.addVelocity(new ƒ.Vector3(0, 0, 10));
         // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
          console.log(this.node);
          window.addEventListener("mousemove", this.handleMouse);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case ƒ.EVENT.NODE_DESERIALIZED:
        this.audioCrash = new ƒ.Audio("./images/gong.mp3");
        this.node.addComponent(new ƒ.ComponentAudio(this.audioCrash));
        this.rgdBodySpaceship.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, this.hndCollision);
        this.rgdBodySpaceship.addEventListener(ƒ.EVENT_PHYSICS.TRIGGER_ENTER, this.hndTrigger);
        this.node.addEventListener("SensorHit",this.hndCollision);
        this.node.addEventListener(ƒ.EVENT.RENDER_PREPARE,this.update);
        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }

    

    hndCollision= ():void =>{
      console.log("bumm");
      //this.node.getComponent(ƒ.ComponentAudio).play(true);
      //this.node.getComponent(ƒ.ComponentAudio).volume = 0.5;
    }

    hndTrigger = (event :ƒ.EventPhysics):void => {
      console.log("entered a pyramid");
      
    
      console.log(event)
      this.rgdBodySpaceship.applyLinearImpulse(ƒ.Vector3.SCALE(this.relativeZ,-5000));
    }

//Todo : Camera mit joints? vllt mit universelJoint


    update = (): void => {
      if(!gameState){
        return;
      }
      gameState.height = this.node.mtxWorld.translation.y;
      this.setRelativeAxes();

      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W])) {
        this.thrust();
      }

      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) {
        this.backwards();
      }

      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
        this.roll(-1);
      }

      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
        this.roll(1);
      }


      //this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeY,this.xAxis * -0.5))
      this.rgdBodySpaceship.applyTorque(new ƒ.Vector3(0, this.xAxis * -10, 0));
      //this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeX, this.yAxis * 1.5));
      this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeX, this.yAxis * 1.5));
     
    }

    private width: number = 0;
    private height: number = 0;
    private xAxis: number = 0;
    private yAxis: number = 0;

    handleMouse = (e: MouseEvent): void => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      let mousePositionY: number = e.clientY;
      let mousePositionX: number = e.clientX;

      this.xAxis = 2 * (mousePositionX / this.width) - 1;
      this.yAxis = 2 * (mousePositionY / this.height) - 1;

    }

    setRelativeAxes(): void {
      this.relativeZ = this.node.mtxWorld.getZ();
      this.relativeZ.scale(5);

      this.relativeY = this.node.mtxWorld.getY();
      this.relativeY.scale(5);

      this.relativeX = this.node.mtxWorld.getX();
      this.relativeY.scale(5);
     
    }

    backwards(): void {
      this.rgdBodySpaceship.applyForce(ƒ.Vector3.SCALE(this.relativeZ, -this.forwardthrust));
    }

    thrust(): void {
      let scaledRotatedDirection: ƒ.Vector3 = ƒ.Vector3.SCALE(this.relativeZ, this.forwardthrust);
      this.rgdBodySpaceship.applyForce(scaledRotatedDirection);
    }


    roll(dir:number): void {
      this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeZ,dir));
    }






    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}