declare namespace Script {
    import f = FudgeCore;
    class GameState extends f.Mutable {
        protected reduceMutator(_mutator: f.Mutator): void;
        height: number;
        velocity: number;
        fuel: number;
        private controller;
        constructor();
    }
}
declare namespace Script {
    import f = FudgeCore;
    let viewport: f.Viewport;
    let cmpMeshTerrain: f.ComponentMesh;
    let gameState: GameState;
    function lerp(start: number, end: number, amt: number): number;
}
declare namespace Script {
    import f = FudgeCore;
    class SensorScript extends f.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        strafeThrust: number;
        forwardthrust: number;
        constructor();
        hndEvent: (_event: Event) => void;
        update: () => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class SpaceShipMovement extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        private rgdBodySpaceship;
        strafeThrust: number;
        forwardthrust: number;
        private relativeX;
        private relativeY;
        private relativeZ;
        private audioCrash;
        constructor();
        hndEvent: (_event: Event) => void;
        hndCollision: () => void;
        hndTrigger: (event: ƒ.EventPhysics) => void;
        update: () => void;
        private width;
        private height;
        private xAxis;
        private yAxis;
        handleMouse: (e: MouseEvent) => void;
        setRelativeAxes(): void;
        backwards(): void;
        thrust(): void;
        roll(dir: number): void;
    }
}
