declare namespace HotlineLA {
    import fAid = FudgeAid;
    import f = FudgeCore;
    class BulletNode extends fAid.NodeSprite {
        constructor(gunNode: f.Node);
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
        constructor();
        private playerSpeed;
        private rgdBody;
        private torsoNode;
        private gunNode;
        private targetX;
        private targetY;
        private bulletSpeed;
        private shootAgain;
        private bulletCount;
        hndEvent: (_event: Event) => void;
        hndBulletHit: (event: Event) => void;
        moveY: (direction: number) => void;
        moveX: (direction: number) => void;
        rotateToMousePointer: (e: MouseEvent) => void;
        shootBullet: () => void;
        hndTime: () => void;
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
        animWalk: fAid.SpriteSheetAnimation;
        rdgBody: f.ComponentRigidbody;
        constructor();
        initializeAnimations(sheetWalk: f.TextureImage, sheetShotDeath: f.TextureImage): void;
        hndTrigger: (event: f.EventPhysics) => void;
        update: () => void;
    }
}
declare namespace HotlineLA {
    import f = FudgeCore;
    let branch: f.Node;
}
declare namespace Script {
    import ƒAid = FudgeAid;
    enum JOB {
        IDLE = 0,
        ATTACK = 1,
        DEAD = 2
    }
    export class enemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        static readonly iSubclass: number;
        private static instructions;
        private turretHead;
        private barrel;
        constructor();
        static get(): ƒAid.StateMachineInstructions<JOB>;
        private static transitDefault;
        private static actDefault;
        private static actAttack;
        private static actIdle;
        private hndEvent;
        private update;
    }
    export {};
}
