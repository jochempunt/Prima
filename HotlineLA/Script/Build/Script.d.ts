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
        hndEvent: (_event: Event) => void;
        hndCollison: () => void;
        moveY: (direction: number) => void;
        moveX: (direction: number) => void;
        rotateToMousePointer: (e: MouseEvent) => void;
        shootBullet(): void;
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
    import f = FudgeCore;
    let branch: f.Node;
}
