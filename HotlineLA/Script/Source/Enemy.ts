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
        isDead: boolean = false;
       
    
        
        walkSpeedPhysics: number = 100;
        chaseSpeed:number = 150;
        currentDirection: f.Vector3 = f.Vector3.ZERO();
        
        
        viewRadius: number = 50;
        viewAngle: number = 120;
        
        statemachine: enemyStateMachine;
        
        
        
        
        isArmed: boolean;
        shootAgain: boolean = true;
        reloadTime: number = 2000;
        gunNode: f.Node;
        
        audioComp: f.ComponentAudio;
        
        constructor(_armed: boolean = true) {
            //gun:f.Node
            super("enemy");
            this.addComponent(new f.ComponentTransform((new f.Matrix4x4())));
            
          
            this.isArmed = _armed;
            //this.rdgBody.collisionGroup = f.COLLISION_GROUP.GROUP_2;
            // gun node stuff
            let gunTransform: f.ComponentTransform = new f.ComponentTransform();
            
            gunTransform.mtxLocal.scale(new f.Vector3(0.5, 0.3, 0));
            
            let mesh: f.ComponentMesh = new f.ComponentMesh(new f.MeshQuad());
            let gunMaterial: f.ComponentMaterial = new f.ComponentMaterial(new f.Material("gunmat", f.ShaderLit));
            let newGunNode: f.Node = new f.Node("Gun");
            
            newGunNode.addComponent(mesh);
            newGunNode.addComponent(gunTransform)
            this.appendChild(newGunNode);
            gunTransform.mtxLocal.translation = new f.Vector3(1.2, -0.8, 0);
            this.gunNode = newGunNode;
            console.log(newGunNode.mtxWorld.translation);
            this.audioComp = new f.ComponentAudio();
            this.addComponent(this.audioComp);
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
            let playerDir: f.Vector3 = f.Vector3.DIFFERENCE(avatarNode.mtxWorld.translation, this.mtxWorld.translation);
            playerDir.normalize();
            // Calculate the angle between the enemy's forward direction and the direction to the player
            let angleRad: number = f.Vector3.DOT(this.mtxWorld.getX(), playerDir);
            let angleDeg: number = Math.acos(angleRad) * (180.0 / Math.PI);
            let playerRange: number = this.mtxWorld.translation.getDistance(avatarNode.mtxWorld.translation);
            
            // Check if the player is within the FOV of the enemy
            if (angleDeg < this.viewAngle / 2) {
                if (playerRange <= this.viewRadius) {
                    // Use a raycast to check if the player is behind a wall or not
                    let rCast: f.RayHitInfo = f.Physics.raycast( new f.Vector3(this.mtxWorld.translation.x,this.mtxWorld.translation.y,0), playerDir, 30, true);
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
            this.showFrame(0);
      
            let coordinates: { x: number, y: number } = this.getCoordinatesFromAngle(this.mtxWorld.rotation.z);
            let endP: f.Vector3 = new f.Vector3(coordinates.x, coordinates.y, 0);
            let ray1: f.RayHitInfo = f.Physics.raycast(new f.Vector3(this.mtxWorld.translation.x,this.mtxWorld.translation.y,0), endP, 2, true);
            this.mtxLocal.rotation = new f.Vector3(0, 0, this.getPlayerAngle() + 5);
            if (ray1.hit) {
               
                if (ray1.rigidbodyComponent.node.name.includes("Wall")) {
                    this.statemachine.transit(JOB.IDLE);
                    return;
                }
            }
            let ray2: f.RayHitInfo = f.Physics.raycast(this.gunNode.mtxWorld.translation, endP, 50, true);
            let behindWall:boolean = false;
            if (ray2.hit) {
                if (ray2.rigidbodyComponent.node.name.includes("Wall")) {
                    behindWall = true
                }
            }
            
            if ((this.mtxWorld.translation.getDistance(avatarNode.mtxWorld.translation) <= 10) && (!behindWall))  {
                this.shootBulletsR();
                return;
            }
            // Move the enemy towards the player's position
            this.getParent().getComponent(f.ComponentRigidbody).applyForce(f.Vector3.SCALE(endP, this.walkSpeedPhysics*1.4))
            //posNode.mtxLocal.translateX(this.attackSpeed * f.Loop.timeFrameGame / 1000);
            if (this.mtxWorld.translation.getDistance(avatarNode.mtxWorld.translation) <= 1.2) {
                this.dispatchEvent(new Event("PlayerHit", { bubbles: true }));
            }
        }
        
        playerHitEvent = (): void => {
            this.dispatchEvent(new Event("PlayerHit", { bubbles: true }));
        }
        
        getPlayerAngle(): number {
            let playerDir: f.Vector3 = f.Vector3.DIFFERENCE(avatarNode.mtxWorld.translation, this.getParent().mtxWorld.translation);
            // Calculate the angle between the enemy's forward direction and the direction to the player
            let angleRad: number = Math.atan2(playerDir.y, playerDir.x);
            return angleRad * (180.0 / Math.PI);
        }
        firstTimePatrol = true;
        
        patroll(deltaTime: number) {
            let posNode: f.Node = this.getParent();
            
            if (this.firstTimePatrol) {
                this.currentDirection = posNode.mtxWorld.getX();
                this.firstTimePatrol = false;
            }
            let rcast1: f.RayHitInfo = f.Physics.raycast(this.mtxWorld.translation, this.currentDirection, 1.5, true);
            if (rcast1.hit) {
                if (rcast1.rigidbodyComponent.typeBody == f.BODY_TYPE.STATIC) {
                    //posNode.mtxLocal.rotateZ(-90);
                    this.mtxLocal.rotateZ(90);
                    this.currentDirection = f.Vector3.TRANSFORMATION(this.currentDirection, f.Matrix4x4.ROTATION_Z(90));
                }
            } else {
                if (deltaTime) {
                    //posNode.mtxLocal.translateX(this.walkspeed * deltaTime);
                    posNode.getComponent(f.ComponentRigidbody).applyForce(f.Vector3.SCALE(this.currentDirection, this.walkSpeedPhysics));
                }
            }
        }
        
        
        
        addBlood(direction: f.Vector3) {
            this.dispatchEvent(new Event("shotEnemy", { bubbles: true }));
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
        
        getCoordinatesFromAngle(angle: number): { x: number, y: number } {
            const radians: number = angle * (Math.PI / 180);
            return {
                x: Math.cos(radians),
                y: Math.sin(radians)
            };
        }
        
        shootBulletsR = (): void => {
            
            if (!this.shootAgain) {
                return;
            }
            // get the endpoint of the direction the enemy is looking at
            let coordinates: { x: number, y: number } = this.getCoordinatesFromAngle(this.mtxWorld.rotation.z);
            // Cast a ray from the starting position of the bullet to the target position
            let startPos: f.Vector3 = this.gunNode.mtxWorld.translation;
            console.log("startpos: "+ startPos);
            let endPos: f.Vector3 = new f.Vector3(coordinates.x, coordinates.y,0 );
            let posNode: f.Node = this.getParent();
            
            //let ray1: f.RayHitInfo = f.Physics.raycast(this.gunNode.mtxWorld.translation,playerDir,20,true);   
            let ray1: f.RayHitInfo = f.Physics.raycast(this.gunNode.mtxWorld.translation, endPos, 20, true);
            if (ray1.hit) {
                console.log(ray1);
                this.audioComp.setAudio(audioShot);
                this.audioComp.play(true);
                branch.addChild(new BulletNode(this.gunNode, ray1));
                console.log("added child yo");
                if (ray1.rigidbodyComponent.node.name.includes("avatar")) {
                    console.log("hit Avatar");
                    new f.Timer(new f.Time, 100, 1, this.playerHitEvent);
                    this.shootAgain = false;
                    new f.Timer(new f.Time(), this.reloadTime, 1, this.enableShooting);
                    //this.dispatchEvent(new Event("PlayerHit", { bubbles: true }));
                    return;
                }
            }
            this.shootAgain = false;
            new f.Timer(new f.Time(), this.reloadTime, 1, this.enableShooting);
        }
        enableShooting = (): void => {
            this.shootAgain = true;
        }
        
        handleHeadshotCollision(collisionDirection: f.Vector3): void {
            
            let angleRad: number = Math.atan2(-collisionDirection.y, -collisionDirection.x);
            let angleDeg: number = angleRad * (180.0 / Math.PI);
            let direction: f.Vector3 = new f.Vector3(0, 0, angleDeg + 180)
            collisionDirection.normalize();
            let onBack: boolean = true;
            // falls enemy durch eine wand durchfallen würde, lass ihn nach "vorne" fallen      
            let checkDirections: f.Vector3[] = [
                new f.Vector3(1, 0, 0),
                new f.Vector3(-1, 0, 0),
                new f.Vector3(0, 1, 0),
                new f.Vector3(0, -1, 0)
            ];
            let rayCastlenghts: number[] = [];
            for (let dir of checkDirections) {
                let wordl: f.Vector3 = f.Vector3.TRANSFORMATION(dir, this.mtxLocal);
                let raycast: f.RayHitInfo = f.Physics.raycast(this.mtxWorld.translation, dir, 10, true);
                if (raycast.hit) {
                    rayCastlenghts.push(raycast.hitDistance);
                } else {
                    rayCastlenghts.push(11);
                }
            }
            let maxDistance = Math.max(...rayCastlenghts);
            let maxDistanceIndex = rayCastlenghts.indexOf(maxDistance);
            let thisDir: f.Vector3 = checkDirections[maxDistanceIndex];
            let angle = Math.atan2(thisDir.y, thisDir.x);
           
            this.mtxLocal.rotation = new f.Vector3(0, 0, angle * 180 / Math.PI);
            //let rcast1: f.RayHitInfo = f.Physics.raycast(this.mtxWorld.translation, collisionDirection, 5, true, f.COLLISION_GROUP.GROUP_2);
            /*if (rcast1.hit) {
                
            }*/
          
            
            new f.Timer(new f.Time, 135, 1, this.setFallinganimation.bind(this, onBack));
            let directionVecto: f.Vector3 = new f.Vector3(1, 0, 0);
            f.Vector3.TRANSFORMATION(directionVecto, f.Matrix4x4.ROTATION(new f.Vector3(0, 0, angleDeg)));
            new f.Timer(new f.Time, 300, 1, this.addBlood.bind(this, directionVecto));
            if (this.isArmed) {
                new f.Timer(new f.Time, 800, 1, this.dropAmmo);
            }
            this.mtxLocal.translateZ(-0.03);
        }
        
        dropAmmo = (): void => {
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
                //this.removeComponent(this.rdgBody);
                this.isDead = true;
                if (this.getParent().getComponent(f.ComponentRigidbody) != null) {
                    this.getParent().removeComponent(this.getParent().getComponent(f.ComponentRigidbody));
                }
                if (this.getCurrentFrame == 3) {
                    this.setFrameDirection(0);
                }
            }
        }
        
        public reset(): void {
            // Reset the enemy's properties to their initial state
         
      
            
            this.currentDirection = new f.Vector3(1,0,0);
            this.setAnimation(this.animWalk);
            this.animState = AnimationState.WALK;
            this.setFrameDirection(1);
            this.framerate = 10;
            this.mtxLocal.rotation = f.Vector3.ZERO();
            this.mtxLocal.translation = new f.Vector3(0, 0, 0);
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