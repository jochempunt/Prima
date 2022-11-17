namespace Script {

    import fAid = FudgeAid;
    import f_ = FudgeCore;

    export class Avatar extends fAid.NodeSprite {

        animFrames: fAid.SpriteSheetAnimation;
        animWalk: fAid.SpriteSheetAnimation;
        animMoves: fAid.SpriteSheetAnimation;
        currAnim:AnimationState;

        public constructor() {
            super("Avatar");
            this.addComponent(new f_.ComponentTransform((new f_.Matrix4x4())));
            //this.initializeAnimations();
        }

        public initializeAnimations(sheetFrames:f_.TextureImage,sheetWalk:f_.TextureImage,sheetMoves:f_.TextureImage): void{
           
        
            let coatWalk: f_.CoatTextured = new f_.CoatTextured(undefined, sheetWalk);
            this.animWalk = new fAid.SpriteSheetAnimation("Walk", coatWalk);
            this.animWalk.generateByGrid(f_.Rectangle.GET(3, 0, 17, 33), 4, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(17));
        
            let coatFrames: f_.CoatTextured = new f_.CoatTextured(undefined, sheetFrames);
            this.animFrames = new fAid.SpriteSheetAnimation("Frames", coatFrames);
            this.animFrames.generateByGrid(f_.Rectangle.GET(0, 0, 18, 33), 2, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(19));
        
            let coatMoveses: f_.CoatTextured = new f_.CoatTextured(undefined, sheetMoves);
            this.animMoves = new fAid.SpriteSheetAnimation("Moves", coatMoveses);
            this.animMoves.generateByGrid(f_.Rectangle.GET(0, 0, 19, 33), 2, 11, f_.ORIGIN2D.BOTTOMCENTER, f_.Vector2.X(17));
            
            this.setAnimation(this.animMoves);
            this.setFrameDirection(1);
            this.framerate = 1;
            this.mtxLocal.translateY(-1);
        
        }

        public setWalk(){
            this.setAnimation(this.animWalk);
            this.framerate =12;
            this.setFrameDirection(1);
            this.currAnim = AnimationState.WALK;
        }


        public setFall(){
            this.setAnimation(this.animMoves);
            this.showFrame(1);
            this.currAnim = AnimationState.MOVES;
        }


        public setSlide(){
            this.setAnimation(this.animMoves);
            this.showFrame(0);
            this.currAnim = AnimationState.MOVES;
        }

        public setDuck(){
            this.setAnimation(this.animFrames);
            this.showFrame(1);
            this.currAnim = AnimationState.MOVES;
        }

        public setStand(){
            this.setAnimation(this.animFrames);
            this.showFrame(0);
            this.currAnim = AnimationState.FRAMES;
        }

    }






















}