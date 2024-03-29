declare namespace HotlineLA {
    import fAid = FudgeAid;
    import f = FudgeCore;
    class Ammo extends fAid.NodeSprite {
        constructor(position: f.Vector3);
    }
}
declare namespace HotlineLA {
    import fAid = FudgeAid;
    import f = FudgeCore;
    class AvatarSpriteNode extends fAid.NodeSprite {
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
    import fAid = FudgeAid;
    import f = FudgeCore;
    class BulletNode extends fAid.NodeSprite {
        startPos: f.Vector3;
        endPos: f.Vector3;
        bulletSpeed: number;
        m: number;
        constructor(gunNode: f.Node, rayHit: f.RayHitInfo);
        moveBullet: () => void;
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
        private shootAgain;
        bulletCount: number;
        private INIT_BULLETS;
        dead: boolean;
        cmpListener: ƒ.ComponentAudioListener;
        cmpAudio: f.ComponentAudio;
        initParams(_playerSpeed: number, _numberOfBulletsStarting: number): void;
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
        patrollSpeed: number;
        chaseSpeed: number;
        currentDirection: f.Vector3;
        viewRadius: number;
        viewAngle: number;
        shotRange: number;
        statemachine: enemyStateMachine;
        shootAgain: boolean;
        reloadTime: number;
        gunNode: f.Node;
        audioComp: f.ComponentAudio;
        constructor(_enemyPatrollSpeed: number, _enemyChaseSpeed: number, _enemyReloadSpeed: number, _enemyFOV: number, _enemyShotRange: number);
        initializeAnimations(sheetWalk: f.TextureImage, sheetShotDeath: f.TextureImage, sheetShotDeathFront: f.TextureImage): void;
        isPlayerInFOV: () => boolean;
        chasePlayer(): void;
        playerHitEvent: () => void;
        getPlayerAngle(): number;
        firstTimePatrol: boolean;
        patroll(deltaTime: number): void;
        addBlood(direction: f.Vector3): void;
        getCoordinatesFromAngle(angle: number): {
            x: number;
            y: number;
        };
        shootBulletsR: () => void;
        enableShooting: () => void;
        handleHeadshotCollision(collisionDirection: f.Vector3): void;
        dropAmmo: () => void;
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
        points: number;
        multiplier: number;
        private controller;
        constructor();
    }
}
declare namespace HotlineLA {
    import f = FudgeCore;
    let branch: f.Node;
    let avatarCmp: CharacterMovementScript;
    let avatarNode: f.Node;
    let itemBranch: f.Node;
    let gameState: GameState;
    let BulletImage: f.TextureImage;
    let AmmoImage: f.TextureImage;
    let bloodSprite: f.TextureImage;
    let audioShot: ƒ.Audio;
    let audioRefill: ƒ.Audio;
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
    class enemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
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
}
declare namespace HotlineLA {
    import f = FudgeCore;
    class Point {
        gameCoordinates: f.Vector3;
        divElement: HTMLDivElement;
        constructor(_gCoordinates: f.Vector3, _divElement: HTMLDivElement);
    }
}
