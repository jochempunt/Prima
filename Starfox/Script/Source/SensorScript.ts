namespace Script {
  import f = FudgeCore;
  f.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

  export class SensorScript extends f.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = f.Component.registerSubclass(SensorScript);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "SensorScript added to ";




    public strafeThrust: number = 2000;
    public forwardthrust: number = 5000;





     //cmpMeshTerrain: f.ComponentMesh;

    //private terrainMesh: f.MeshTerrain;  //= <f.MeshTerrain>cmpMeshTerrain.mesh;




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
          f.Debug.log(this.message, this.node);
          f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
          break;
        case f.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case f.EVENT.NODE_DESERIALIZED:

          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }








    //Todo : Camera mit joints? vllt mit universelJoint


    update = (): void => {
      if (!cmpMeshTerrain) {
        return;
      }
      if (this.node.getParent() != null) {
        let terrainInfo: f.TerrainInfo = (<f.MeshTerrain>cmpMeshTerrain.mesh).getTerrainInfo(this.node.getParent().mtxWorld.translation, cmpMeshTerrain.mtxWorld);
        //console.log(this.node.getParent().name + ": " + terrainInfo.distance);

        if (terrainInfo.distance <= 0) {
          this.node.dispatchEvent(new Event("SensorHit", { bubbles: true }));
        }

      } else {
        //console.log(this.node);
      }




    }













    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}