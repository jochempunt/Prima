namespace HotlineLA {
    import fAid = FudgeAid;
    import f = FudgeCore;



    export enum AnimationState{
        WALK,DEADSHOT
      }


    export class Enemy extends fAid.NodeSprite {
        
        animState:AnimationState;
        animShotDeath: fAid.SpriteSheetAnimation;
        animWalk: fAid.SpriteSheetAnimation;
        rdgBody: f.ComponentRigidbody;
        constructor() {
            super("enemy");
           this.addComponent(new f.ComponentTransform((new f.Matrix4x4())));
            this.rdgBody= new f.ComponentRigidbody();
            this.rdgBody.effectGravity = 0;
            this.rdgBody.mass = 0.1;
            this.rdgBody.typeBody = f.BODY_TYPE.KINEMATIC;
            this.rdgBody.effectRotation.x = 0;
            this.rdgBody.effectRotation.y = 0;

            this.addComponent(this.rdgBody);
            
        }

        public initializeAnimations(sheetWalk:f.TextureImage,sheetShotDeath: f.TextureImage): void{
           
        
            let coatWalk: f.CoatTextured = new f.CoatTextured(undefined, sheetWalk);
            this.animWalk = new fAid.SpriteSheetAnimation("Walk", coatWalk);
            this.animWalk.generateByGrid(f.Rectangle.GET(4, 0, 25, 30), 9, 11, f.ORIGIN2D.CENTER, f.Vector2.X(33));
        

            let coatDeathShot: f.CoatTextured = new f.CoatTextured(undefined, sheetShotDeath);
            this.animShotDeath = new fAid.SpriteSheetAnimation("Walk", coatDeathShot);
            this.animShotDeath.generateByGrid(f.Rectangle.GET(2, 0, 60, 30), 5, 11,f.ORIGIN2D.CENTERLEFT, f.Vector2.X(60));

          
            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 4;
            this.rdgBody.addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER,this.hndTrigger);
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }


        hndTrigger =(event:f.EventPhysics):void=>{
            if(event.cmpRigidbody.node.name == "bullet"){
                this.setAnimation(this.animShotDeath);
                this.animState = AnimationState.DEADSHOT;
                this.framerate = 10;
            }
        }


        update = ():void => {
            if( this.animState == AnimationState.DEADSHOT){
                this.removeEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER,this.hndTrigger);
                this.removeComponent(this.rdgBody);
                if(this.getCurrentFrame >= 3){
                   
                    this.showFrame(3);
                    this.framerate = 0;
                    this.setFrameDirection(0);
                   
                    this.animState = AnimationState.WALK;
                    
                }
            }
        }

    }







}