declare namespace HotlineLA {
    import fAid = FudgeAid;
    import f = FudgeCore;
    class BulletNode extends fAid.NodeSprite {
        startPos: f.Vector3;
        endPos: f.Vector3;
        bulletSpeed: number;
        constructor(gunNode: f.Node, rayHit: f.RayHitInfo);
        moveBullet: () => void;
    }
}
declare namespace HotlineLA {
    import f = FudgeCore;
    class BulletScript extends f.ComponentScript {
        static readonly iSubclass: number;
        private rgdBody;
        constructor();
        hndEvent: (_event: Event) => void;
        init(): void;
        bulletDeath: () => void;
        hndCollision: (event: f.EventPhysics) => void;
    }
}
declare namespace HotlineLA {
    import f = FudgeCore;
    class CharacterMovementScript extends f.ComponentScript {
        static readonly iSubclass: number;
        private avatarSprites;
        private initialtransform;
        constructor();
        private PLAYER_SPEED;
        private rgdBody;
        private torsoNode;
        private gunNode;
        private targetX;
        private targetY;
        private BULLETSPEED;
        private shootAgain;
        bulletCount: number;
        private MAX_BULLETS;
        dead: boolean;
        cmpListener: ƒ.ComponentAudioListener;
        private audioShot;
        private cmpAudio;
        initialiseAnimations(shootingImg: f.TextureImage, deathImg: f.TextureImage): void;
        hndEvent: (_event: Event) => void;
        setup: () => void;
        moveY: (direction: number) => void;
        die(): void;
        moveX: (direction: number) => void;
        rotateToMousePointer: (e: MouseEvent) => void;
        shootBulletsR: () => void;
        reloadBullets: (bulletsToReload: number) => void;
        enableShooting: () => void;
        reset(): void;
    }
}
declare namespace HotlineLA {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace HotlineLA {
    import fAid = FudgeAid;
    import f = FudgeCore;
    enum AnimationState {
        WALK = 0,
        DEADSHOT = 1
    }
    class Enemy extends fAid.NodeSprite {
        animState: AnimationState;
        animShotDeath: fAid.SpriteSheetAnimation;
        animShotDeathFront: fAid.SpriteSheetAnimation;
        animWalk: fAid.SpriteSheetAnimation;
        rdgBody: f.ComponentRigidbody;
        bloodNode: f.Node;
        isDead: boolean;
        walkspeed: number;
        attackSpeed: number;
        viewRadius: number;
        viewAngle: number;
        statemachine: enemyStateMachine;
        constructor();
        initializeAnimations(sheetWalk: f.TextureImage, sheetShotDeath: f.TextureImage, sheetShotDeathFront: f.TextureImage): void;
        isPlayerInFOV: () => boolean;
        chasePlayer(): void;
        getPlayerAngle(): number;
        patroll(deltaTime: number): void;
        addBlood(direction: f.Vector3): void;
        handleHeadshotCollision(collisionDirection: f.Vector3): void;
        setFallinganimation(onBack: boolean): void;
        cleanUpAfterDeath(): void;
        reset(): void;
    }
}
declare namespace HotlineLA {
    import f = FudgeCore;
    class GameState extends f.Mutable {
        protected reduceMutator(_mutator: f.Mutator): void;
        bulletCount: number;
        private controller;
        constructor();
    }
}
declare namespace HotlineLA {
    import f = FudgeCore;
    let branch: f.Node;
    let avatarCmp: CharacterMovementScript;
    let avatarNode: f.Node;
    let gameState: GameState;
    let BulletImage: f.TextureImage;
    let bloodSprite: f.TextureImage;
}
declare namespace HotlineLA {
    import fAid = FudgeAid;
    import f = FudgeCore;
    class avatar extends fAid.NodeSprite {
        armedAnimation: fAid.SpriteSheetAnimation;
        deathSprite: fAid.SpriteSheetAnimation;
        constructor();
        initaliseAnimations(sheetShot: f.TextureImage, deathImg: f.TextureImage): void;
        shootAnim(): void;
        setDeathSprite(): void;
        returnToNormal: () => void;
        reset(): void;
    }
}
declare namespace HotlineLA {
    import f = FudgeCore;
    import ƒAid = FudgeAid;
    enum JOB {
        IDLE = 0,
        PATROLL = 1,
        ATTACK = 2,
        DEAD = 3
    }
    export class enemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        static readonly iSubclass: number;
        private static instructions;
        private enemy;
        private deltaTime;
        private timer;
        private IDLE_TIME;
        private PATROLL_TIME;
        constructor();
        static get(): ƒAid.StateMachineInstructions<JOB>;
        private static transitDefault;
        private static actDefault;
        private static actPatroll;
        private static actAttack;
        private static actDead;
        private static actIdle;
        private hndEvent;
        resetState(): void;
        hndShotDead: (normal: f.Vector3) => void;
        private update;
        private hndSwitchToPatroll;
        private hndSwitchToIdle;
    }
    export {};
}
