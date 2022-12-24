namespace HotlineLA {

    import fAid = FudgeAid;
    import f = FudgeCore;


    export class BulletNode extends fAid.NodeSprite{



        constructor(gunNode:f.Node) {
            super("bullet");
           

 
            let bulletMaterial: f.Material = new f.Material("bulletMaterial", f.ShaderLit);
      
      
            //this.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 1));
      
            
          
            let componentMat: f.ComponentMaterial = this.getComponent(f.ComponentMaterial);
            componentMat.material = bulletMaterial;
            componentMat.clrPrimary = f.Color.CSS("black");
      
            let componentTransf: f.ComponentTransform = new f.ComponentTransform();
            componentTransf.mtxLocal.translation = gunNode.mtxWorld.translation;
            componentTransf.mtxLocal.translateZ(-0.1);
      
            componentTransf.mtxLocal.rotation = gunNode.mtxWorld.rotation;
            componentTransf.mtxLocal.scale(new f.Vector3(0.2, 0.2, 1));
            this.addComponent(componentTransf);
      
            let componentRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody();
            componentRigidbody.effectGravity = 0;
            componentRigidbody.mass = 0.1;
            // bullets can only rotate around the z axis
            componentRigidbody.effectRotation.x = 0;
            componentRigidbody.effectRotation.y = 0;

            //componentRigidbody.mtxPivot.scale(new f.Vector3(0.2,0.2,1));

            componentRigidbody.isTrigger = true;
            componentRigidbody.dampRotation = 4.5;
            componentRigidbody.collisionGroup = f.COLLISION_GROUP.GROUP_1;
            componentRigidbody.dampTranslation = 0;
            this.addComponent(componentRigidbody);//#endregion
      
      
            let script: BulletScript = new BulletScript();
      
            this.addComponent(script);
      
        }
    }






















} 