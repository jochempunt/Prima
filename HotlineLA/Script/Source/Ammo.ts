namespace HotlineLA{

    import fAid = FudgeAid;
    import f = FudgeCore;


    export class Ammo extends fAid.NodeSprite {
        
        constructor(position:f.Vector3) {
            super("ammo");
            let componentTransf: f.ComponentTransform = new f.ComponentTransform();
            componentTransf.mtxLocal.translation = position;
            componentTransf.mtxLocal.translateZ(-0.1);
            componentTransf.mtxLocal.scaling =new f.Vector3(1.5,1.5,3);
            this.addComponent(componentTransf);

            let ammoMaterial: f.Material = new f.Material("ammoMaterial", f.ShaderLitTextured);
            let coatAmmo: f.CoatTextured = new f.CoatTextured(undefined, AmmoImage);
            ammoMaterial.coat = coatAmmo;

            //this.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 1));

            let componentMat: f.ComponentMaterial = this.getComponent(f.ComponentMaterial);
            componentMat.material = ammoMaterial;


            let ComponentRigidbody = new f.ComponentRigidbody();
            ComponentRigidbody.isTrigger = true;
            ComponentRigidbody.effectGravity = 0
   
            ComponentRigidbody.collisionGroup = f.COLLISION_GROUP.GROUP_2;
          
            this.addComponent(ComponentRigidbody);


        }




    }
}