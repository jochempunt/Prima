namespace HotlineLA {

    import fAid = FudgeAid;
    import f = FudgeCore;


    export class BulletNode extends fAid.NodeSprite {

        startPos: f.Vector3;
        endPos: f.Vector3;
        bulletSpeed: number = 37;

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
            componentTransf.mtxLocal.translation = gunNode.mtxWorld.translation;
            componentTransf.mtxLocal.translateZ(-0.02);

            componentTransf.mtxLocal.rotation = gunNode.mtxWorld.rotation;
            componentTransf.mtxLocal.scale(new f.Vector3(1.5,1.5, 1.5));
            this.addComponent(componentTransf);

            this.startPos = gunNode.mtxWorld.translation;
            this.endPos = rayHit.hitPoint;


            f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.moveBullet);

        }
        moveBullet = (): void => {
            // Calculate the direction the bullet should travel
            let distanceTravelled: number = this.startPos.getDistance(this.mtxWorld.translation);
           
            if (distanceTravelled >= this.endPos.getDistance(this.startPos) -0.5) {
                this.getParent().removeChild(this);
                f.Loop.removeEventListener(f.EVENT.LOOP_FRAME, this.moveBullet);
                return;
            }
            // Update the position of the bullet
            this.mtxLocal.translateX(this.bulletSpeed * (f.Loop.timeFrameGame/1000));

            
        }






















    }
}