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

        bloodNode: f.Node;
        isDead:boolean= false;
        walkspeed: number = 3;
        attackSpeed: number = 3.5;

        viewRadius: number = 50;
        viewAngle: number = 120;

        statemachine: enemyStateMachine;

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
            this.rdgBody.collisionGroup = f.COLLISION_GROUP.GROUP_2;
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


            //this.mtxLocal.translation =new f.Vector3(this.mtxLocal.translation.x,this.mtxLocal.translation.y,-0.1) ;
            //this.mtxLocal.scale(new f.Vector3(1,1,1));
            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 10;

            this.statemachine = new enemyStateMachine();

            this.addComponent(this.statemachine);
        }




        isPlayerInFOV = (): boolean => {
            let playerDir: f.Vector3 = f.Vector3.DIFFERENCE(avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            playerDir.normalize();
            // Calculate the angle between the enemy's forward direction and the direction to the player
            let angleRad: number = f.Vector3.DOT(this.getParent().mtxWorld.getX(), playerDir);
            let angleDeg: number = Math.acos(angleRad) * (180.0 / Math.PI);
            let playerRange: number = this.mtxWorld.translation.getDistance(avatarNode.mtxWorld.translation);

            // Check if the player is within the FOV of the enemy
            if (angleDeg < this.viewAngle / 2) {


                if (playerRange <= this.viewRadius) {
                    // Use a raycast to check if the player is behind a wall or not
                    let rCast: f.RayHitInfo = f.Physics.raycast(this.mtxWorld.translation, playerDir, 50, true);
                    if (rCast.hit) {
                        if (rCast.rigidbodyComponent.node.name == "avatar") {

                            return true;
                        }
                    }
                }
            }
            return false;
        }




        chasePlayer() {
            let playerDir: f.Vector3 = f.Vector3.DIFFERENCE(avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            playerDir.normalize();
            let posNode: f.Node = this.getParent();
            posNode.mtxLocal.rotation = new f.Vector3(0, 0, this.getPlayerAngle());
            // Move the enemy towards the player's position

            posNode.mtxLocal.translateX(this.attackSpeed * f.Loop.timeFrameGame / 1000);
            if (this.mtxWorld.translation.getDistance(avatarNode.mtxWorld.translation) <= 1.2) {
                this.dispatchEvent(new Event("PlayerHit", { bubbles: true }));
            }
        }

        getPlayerAngle(): number {
            let playerDir: f.Vector3 = f.Vector3.DIFFERENCE(avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            // Calculate the angle between the enemy's forward direction and the direction to the player
            let angleRad: number = Math.atan2(playerDir.y, playerDir.x);
            return angleRad * (180.0 / Math.PI);
        }


        patroll(deltaTime: number) {

            let posNode: f.Node = this.getParent();
            let rcast1: f.RayHitInfo = f.Physics.raycast(posNode.mtxWorld.translation, posNode.mtxWorld.getX(), 1.5, true);
            if (rcast1.hit ) {
                if (rcast1.rigidbodyComponent.typeBody == f.BODY_TYPE.STATIC){
                    posNode.mtxLocal.rotateZ(-90);
                }
                
            } else {
                if (deltaTime) {
                    posNode.mtxLocal.translateX(this.walkspeed * deltaTime);
                }
            }
        }



        addBlood(direction: f.Vector3) {
            let bloodNode: f.Node = new f.Node("blood");
            let spriteMaterial: f.Material = new f.Material("bloodmaterial", f.ShaderLitTextured);
            let coatBlood: f.CoatTextured = new f.CoatTextured(undefined, bloodSprite);
            spriteMaterial.coat = coatBlood;
            let compMat: f.ComponentMaterial = new f.ComponentMaterial(spriteMaterial);

            let cmpMesh: f.ComponentMesh = new f.ComponentMesh(new f.MeshQuad);

            let cmpTransf: f.ComponentTransform = new f.ComponentTransform();

            cmpTransf.mtxLocal.translate(f.Vector3.NORMALIZATION(direction, 4));
            cmpTransf.mtxLocal.scale(new f.Vector3(3, 3, 1));
            bloodNode.addComponent(compMat);
            bloodNode.addComponent(cmpMesh);
            bloodNode.addComponent(cmpTransf);
            this.addChild(bloodNode);
        }


        handleHeadshotCollision(collisionDirection: f.Vector3): void {

            let angleRad: number = Math.atan2(-collisionDirection.y, -collisionDirection.x);
            let angleDeg: number = angleRad * (180.0 / Math.PI);

            let direction: f.Vector3 = new f.Vector3(0, 0, angleDeg)
           

            let onBack: boolean = true;
            // falls enemy durch eine wand durchfallen würde, lass ihn nach "vorne" fallen
            let rcast1: f.RayHitInfo = f.Physics.raycast(this.mtxWorld.translation, new f.Vector3(-collisionDirection.x, -collisionDirection.y, 0), 7, true);
            if (rcast1.hit) {
                if (rcast1.rigidbodyComponent.node.name.includes("Wall")) {
                    direction = new f.Vector3(0, 0, angleDeg + 180);
                    onBack = false;
                }

            }
            //TODO do this after the bullet has hit, not before
            this.mtxLocal.rotation = direction;

            new f.Timer(new f.Time, 135, 1, this.setFallinganimation.bind(this, onBack));
            let directionVecto: f.Vector3 = new f.Vector3(1, 0, 0);

            f.Vector3.TRANSFORMATION(directionVecto, f.Matrix4x4.ROTATION(new f.Vector3(0, 0, angleDeg)));

            new f.Timer(new f.Time, 300, 1, this.addBlood.bind(this, directionVecto));
            new f.Timer(new f.Time, 800, 1, this.dropAmmo);
            this.mtxLocal.translateZ(-0.3);


        }

        dropAmmo=():void=>{
            
            let ammo1: Ammo = new Ammo(this.mtxWorld.translation);
            itemBranch.addChild(ammo1);

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




        // remove the rigidbody instantly after death, and stop the animation when it came to the last frame
        cleanUpAfterDeath() {
            if (this.animState == AnimationState.DEADSHOT) {

                this.removeComponent(this.rdgBody);
                this.isDead = true;
                if (this.getCurrentFrame == 3) {
                    this.setFrameDirection(0);
                }
            }
        }



        public reset(): void {
            // Reset the enemy's properties to their initial state

            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 10;

            this.mtxLocal.rotation = f.Vector3.ZERO();

            this.statemachine.resetState();

            // Remove the blood node if it exists
            if (this.isDead) {
                this.removeAllChildren();
                this.bloodNode = undefined;
                this.addComponent(this.rdgBody);
                this.isDead = false;
            }


        }

    }
}