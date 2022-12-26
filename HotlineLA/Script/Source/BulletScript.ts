namespace HotlineLA {
  import f = FudgeCore;
  f.Project.registerScriptNamespace(HotlineLA);  // Register the namespace to FUDGE for serialization

  export class BulletScript extends f.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = f.Component.registerSubclass(BulletScript);
    // Properties may be mutated by users in the editor via the automatically created user interface

    private rgdBody: f.ComponentRigidbody;

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

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case f.EVENT.COMPONENT_ADD:
          console.log("registered");
          this.rgdBody = this.node.getComponent(f.ComponentRigidbody);
          this.rgdBody.addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);
          this.init();
          break;
        case f.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
          this.rgdBody.removeEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, this.hndCollision);
          break;
        case f.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible

          break;
      }
    }



    init() {
      new f.Timer(new f.Time, 3000, 1, this.bulletDeath);
    }

    bulletDeath = (): void => {
      this.node.dispatchEvent(new Event("BulletHit", { bubbles: true }));
    }



    hndCollision = (event: f.EventPhysics): void => {
      console.log(event);
      console.log("boom");

      this.node.dispatchEvent(new Event("BulletHit", { bubbles: true }));
      if (event.cmpRigidbody.node.name.includes("Enemy")) {
        this.node.dispatchEvent(new Event("CharacterHit", { bubbles: true }));
      }

    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}