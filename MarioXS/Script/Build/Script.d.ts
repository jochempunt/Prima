declare namespace Script {
    import fAid = FudgeAid;
    import f_ = FudgeCore;
    class Avatar extends fAid.NodeSprite {
        animFrames: fAid.SpriteSheetAnimation;
        animWalk: fAid.SpriteSheetAnimation;
        animMoves: fAid.SpriteSheetAnimation;
        currAnim: AnimationState;
        constructor();
        initializeAnimations(sheetFrames: f_.TextureImage, sheetWalk: f_.TextureImage, sheetMoves: f_.TextureImage): void;
        setWalk(): void;
        setFall(): void;
        setSlide(): void;
        setDuck(): void;
        setStand(): void;
    }
}
declare namespace Script {
    enum AnimationState {
        WALK = 0,
        FRAMES = 1,
        MOVES = 2
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class ScriptRotator extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        speead: number;
        constructor();
        hndEvent: (_event: Event) => void;
        update: () => void;
    }
}
