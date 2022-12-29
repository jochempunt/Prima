namespace HotlineLA {



    import fAid = FudgeAid;
    import f = FudgeCore;


    export class avatar extends fAid.NodeSprite {
        armedAnimation: fAid.SpriteSheetAnimation;
        deathSprite: fAid.SpriteSheetAnimation;
        constructor() {
            super("avatarSprite");
        }


        initaliseAnimations(sheetShot: f.TextureImage, deathImg: f.TextureImage) {
            let coatShot: f.CoatTextured = new f.CoatTextured(undefined, sheetShot);

            let cmpTransf: f.ComponentTransform = new f.ComponentTransform();

            this.armedAnimation = new fAid.SpriteSheetAnimation("Shot", coatShot);
            this.armedAnimation.generateByGrid(f.Rectangle.GET(0, 0, 50, 30), 2, 11, f.ORIGIN2D.CENTER, f.Vector2.X(50));
            let coatDeath: f.CoatTextured = new f.CoatTextured(undefined, deathImg);
            this.deathSprite = new fAid.SpriteSheetAnimation("Death", coatDeath);
            this.deathSprite.generateByGrid(f.Rectangle.GET(0, 0, 55, 30), 1, 11, f.ORIGIN2D.CENTERLEFT, f.Vector2.X(55));





            this.addComponent(cmpTransf);
            this.mtxLocal.translateX(1);

            this.setAnimation(this.armedAnimation);

            this.setFrameDirection(0);
            this.framerate = 0;

        }

        shootAnim(): void {
            this.showFrame(1);
            new f.Timer(new f.Time, 120, 1, this.returnToNormal);
        }

        setDeathSprite(){
            this.setAnimation(this.deathSprite);
        }

        returnToNormal = (): void => {
            this.showFrame(0);
        }



        reset():void{
            this.setAnimation(this.armedAnimation);
            this.showFrame(0);
        }
    }



}