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
        walkspeed: number = 3;
        attackSpeed: number = 3.5;

        viewRadius: number = 10;
        viewAngle: number = 120;

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




        isPlayerInFOV = (): boolean => {
            let playerDir: f.Vector3 = f.Vector3.DIFFERENCE(avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            playerDir.normalize();
            // Calculate the angle between the enemy's forward direction and the direction to the player
            let angleRad: number = f.Vector3.DOT(this.getParent().mtxWorld.getX(), playerDir);
            let angleDeg: number = Math.acos(angleRad) * (180.0 / Math.PI);
            let playerRange: number = this.mtxWorld.translation.getDistance(avatarNode.mtxWorld.translation);

            // Check if the player is within the FOV of the enemy
            if (angleDeg < this.viewAngle / 2) {
                console.log("target is in da house");

                if (playerRange <= this.viewRadius) {
                    // Use a raycast to check if the player is behind a wall or not
                    let rCast: f.RayHitInfo = f.Physics.raycast(this.mtxWorld.translation, playerDir, 50, true);
                    if (rCast.hit) {
                        if (rCast.rigidbodyComponent.node.name == "avatar") {
                            console.log("direct view on target!");
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
            let rCast: f.RayHitInfo = f.Physics.raycast(this.mtxWorld.translation, playerDir, 50, true);
            let posNode: f.Node = this.getParent();
            posNode.mtxLocal.rotation = new f.Vector3(0, 0, this.getPlayerAngle());
            // Move the enemy towards the player's position

            posNode.mtxLocal.translateX(this.attackSpeed * f.Loop.timeFrameGame / 1000);

        }

        getPlayerAngle(): number {
            let playerDir: f.Vector3 = f.Vector3.DIFFERENCE(avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            // Calculate the angle between the enemy's forward direction and the direction to the player
            let angleRad: number = Math.atan2(playerDir.y, playerDir.x);
            return angleRad * (180.0 / Math.PI);
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



        addBlood(direction: f.Vector3) {
            let bloodNode: f.Node = new f.Node("blood");
            let spriteMaterial: f.Material = new f.Material("bloodmaterial", f.ShaderLitTextured);
            let coatBlood: f.CoatTextured = new f.CoatTextured(undefined, bloodSprite);
            spriteMaterial.coat = coatBlood;
            let compMat: f.ComponentMaterial = new f.ComponentMaterial(spriteMaterial);

            let cmpMesh: f.ComponentMesh = new f.ComponentMesh(new f.MeshQuad);

            let cmpTransf: f.ComponentTransform = new f.ComponentTransform();
            console.log("translation of blood: " + f.Vector3.SCALE(direction, 1));
            cmpTransf.mtxLocal.translate(f.Vector3.NORMALIZATION(direction, 4));
            cmpTransf.mtxLocal.scale(new f.Vector3(3, 3, 1));
            bloodNode.addComponent(compMat);
            bloodNode.addComponent(cmpMesh);
            bloodNode.addComponent(cmpTransf);
            this.addChild(bloodNode);
        }


        handleHeadshotCollision(collisionDirection: f.Vector3): void {
            let angleRad: number = Math.atan2(collisionDirection.y, collisionDirection.x);
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

            new f.Timer(new f.Time, 135, 1, this.setFallinganimation.bind(this, onBack));
            let directionVecto: f.Vector3 = new f.Vector3(1, 0, 0);

            f.Vector3.TRANSFORMATION(directionVecto, f.Matrix4x4.ROTATION(new f.Vector3(0, 0, angleDeg)));

            new f.Timer(new f.Time, 300, 1, this.addBlood.bind(this, directionVecto));

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
                if (this.getCurrentFrame == 3) {
                    this.setFrameDirection(0);
                }
            }



        }
    }
}