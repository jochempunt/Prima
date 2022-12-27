namespace HotlineLA{



    import fAid = FudgeAid;
    import f = FudgeCore;


    export class avatar extends fAid.NodeSprite {
    armedAnimation:  fAid.SpriteSheetAnimation;
        constructor() {
            super("avatarSprite");
        }


        initaliseAnimations(sheetShot:f.TextureImage){
            let coatShot: f.CoatTextured = new f.CoatTextured(undefined, sheetShot);
            this.armedAnimation = new fAid.SpriteSheetAnimation("Walk", coatShot);    
            this.armedAnimation.generateByGrid(f.Rectangle.GET(0, 0, 50, 30), 2, 11, f.ORIGIN2D.CENTER, f.Vector2.X(50));
            let cmpTransf:f.ComponentTransform = new f.ComponentTransform();
            this.addComponent(cmpTransf);
            this.mtxLocal.translateX(1);

            this.setAnimation(this.armedAnimation);
            this.setFrameDirection(0);
            this.framerate = 0;

        }

        shootAnim():void{
            this.showFrame(1);
            new f.Timer(new f.Time,120,1,this.returnToNormal);
        }

        returnToNormal=():void=>{
            this.showFrame(0);
        }
    }



}