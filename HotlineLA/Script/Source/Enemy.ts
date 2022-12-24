namespace HotlineLA {
    import fAid = FudgeAid;
    import f = FudgeCore;



    export enum AnimationState {
        WALK, DEADSHOT
    }


    export class Enemy extends fAid.NodeSprite {

        animState: AnimationState;
        animShotDeath: fAid.SpriteSheetAnimation;
        animShotDeathFront: fAid.SpriteSheetAnimation;
        animWalk: fAid.SpriteSheetAnimation;
        rdgBody: f.ComponentRigidbody;
        isShot: boolean = false;
        walkspeed: number = 2.6;
        constructor() {
            super("enemy");
            this.addComponent(new f.ComponentTransform((new f.Matrix4x4())));
            this.rdgBody = new f.ComponentRigidbody();
            this.rdgBody.effectGravity = 0;
            this.rdgBody.mass = 0.1;
            this.rdgBody.typeBody = f.BODY_TYPE.KINEMATIC;
            this.rdgBody.effectRotation.x = 0;
            this.rdgBody.effectRotation.y = 0;

            this.addComponent(this.rdgBody);
            this.rdgBody.collisionGroup = f.COLLISION_GROUP.GROUP_1;
        }

        public initializeAnimations(sheetWalk: f.TextureImage, sheetShotDeath: f.TextureImage, sheetShotDeathFront: f.TextureImage): void {


            let coatWalk: f.CoatTextured = new f.CoatTextured(undefined, sheetWalk);
            this.animWalk = new fAid.SpriteSheetAnimation("Walk", coatWalk);
            this.animWalk.generateByGrid(f.Rectangle.GET(4, 0, 25, 30), 9, 11, f.ORIGIN2D.CENTER, f.Vector2.X(33));


            let coatDeathShot: f.CoatTextured = new f.CoatTextured(undefined, sheetShotDeath);
            this.animShotDeath = new fAid.SpriteSheetAnimation("Walk", coatDeathShot);
            this.animShotDeath.generateByGrid(f.Rectangle.GET(2, 0, 60, 30), 5, 11, f.ORIGIN2D.CENTERLEFT, f.Vector2.X(60));


            let coatDeathShotFront: f.CoatTextured = new f.CoatTextured(undefined, sheetShotDeathFront);
            this.animShotDeathFront = new fAid.SpriteSheetAnimation("Walk", coatDeathShotFront);
            this.animShotDeathFront.generateByGrid(f.Rectangle.GET(6, 0, 72, 35), 5, 11, f.ORIGIN2D.CENTERLEFT, f.Vector2.X(72));


            this.mtxLocal.translateZ(-0.1);
            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 10;

            let statemachine: enemyStateMachine = new enemyStateMachine();

            this.addComponent(statemachine);
        }



        patroll(deltaTime: number) {

            let posNode: f.Node = this.getParent();
            let rcast1: f.RayHitInfo = f.Physics.raycast(posNode.mtxWorld.translation, posNode.mtxWorld.getX(), 1.5, true, f.COLLISION_GROUP.GROUP_2);
            if (rcast1.hit) {
                console.log("WAAAAALLL");
                posNode.mtxLocal.rotateZ(-90);
            } else {
                if (deltaTime) {
                    posNode.mtxLocal.translateX(this.walkspeed * deltaTime);
                }
            }
        }



        setHeadShotAnimation(collisionDirection: f.Vector3): void {
            let angleRad: number = Math.atan2(collisionDirection.y, -collisionDirection.x);
            let angleDeg: number = angleRad * (180.0 / Math.PI);

            let direction: f.Vector3 = new f.Vector3(0, 0, angleDeg)

            console.log(collisionDirection);
            let onBack: boolean = true;
            // falls enemy durch eine wand durchfallen würde, lass ihn nach "vorne" fallen
            let rcast1: f.RayHitInfo = f.Physics.raycast(this.mtxWorld.translation, collisionDirection, 5, true, f.COLLISION_GROUP.GROUP_2);
            if (rcast1.hit) {
                console.log(rcast1.rigidbodyComponent.node.name)
                direction = new f.Vector3(0, 0, -angleDeg);
                onBack = false;
                console.log("i hitta wall!!");
            }
            this.getParent().mtxLocal.rotation = direction;
            this.setFallinganimation(onBack);

        }


        setFallinganimation(onBack: boolean) {
            if (onBack) {
                this.setAnimation(this.animShotDeath);

                this.framerate = 10;
            } else {
                this.setAnimation(this.animShotDeathFront);
                this.framerate = 5;
            }
            this.animState = AnimationState.DEADSHOT;
        }


        update = (): void => {
            this.checkEndDeathAnimation();
        }


        checkEndDeathAnimation() {
            if (this.animState == AnimationState.DEADSHOT) {

                this.removeComponent(this.rdgBody);
                if (this.getCurrentFrame == 3) {
                    this.setFrameDirection(0);
                }
            }

        }







    }
}