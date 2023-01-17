namespace HotlineLA {

    import fAid = FudgeAid;
    import f = FudgeCore;


    export class BulletNode extends fAid.NodeSprite {

        startPos: f.Vector3;
        endPos: f.Vector3;
        bulletSpeed: number = 37;
        m:number = 0;
        constructor(gunNode: f.Node,rayHit:f.RayHitInfo) {
            super("bullet");



            let bulletMaterial: f.Material = new f.Material("bulletMaterial", f.ShaderLitTextured);
            let coatBullet: f.CoatTextured = new f.CoatTextured(undefined, BulletImage);
            bulletMaterial.coat = coatBullet;

            //this.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 1));



            let componentMat: f.ComponentMaterial = this.getComponent(f.ComponentMaterial);
            componentMat.material = bulletMaterial;
            //componentMat.clrPrimary = f.Color.CSS("black");

            let componentTransf: f.ComponentTransform = new f.ComponentTransform();
            
            console.log("gun node translation: "+ gunNode.mtxWorld.translation);
            
            
            componentTransf.mtxLocal.translation = gunNode.mtxWorld.translation;
            
           
            //componentTransf.mtxLocal.translateZ(-2);

            componentTransf.mtxLocal.rotation = new f.Vector3(0,0,gunNode.mtxWorld.rotation.z);

            console.log("rotation: "+gunNode.mtxWorld.rotation);
            componentTransf.mtxLocal.scale(new f.Vector3(1.5,1.5, 1.5));
            this.addComponent(componentTransf);

            

            this.startPos = gunNode.mtxWorld.translation;
      
            console.log(this.startPos);
            this.endPos = rayHit.hitPoint;
            this.endPos = new f.Vector3(this.endPos.x,this.endPos.y,0);
            console.log(this.mtxLocal);
            f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.moveBullet);

        }
        moveBullet = (): void => {
           
            if(this.m >= 40){
                console.log(this.mtxLocal);
                return;
            }
            
            // Calculate the direction the bullet should travel
            let distanceTravelled: number = this.startPos.getDistance(this.mtxWorld.translation);
           
            if (distanceTravelled >= this.endPos.getDistance(this.startPos) -0.5) {
                this.getParent().removeChild(this);
                f.Loop.removeEventListener(f.EVENT.LOOP_FRAME, this.moveBullet);
                return;
            }
            // Update the position of the bullet
            this.mtxLocal.translateX(this.bulletSpeed * (f.Loop.timeFrameGame/1000));

            this.m++;

           

        }






















    }
}