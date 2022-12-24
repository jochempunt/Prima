namespace HotlineLA {
    import f = FudgeCore;
    import ƒAid = FudgeAid;
    f.Project.registerScriptNamespace(HotlineLA);  // Register the namespace to FUDGE for serialization

    enum JOB {
        IDLE,PATROLL,ATTACK, DEAD
    }

    export class enemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        public static readonly iSubclass: number = f.Component.registerSubclass(enemyStateMachine);
        private static instructions: ƒAid.StateMachineInstructions<JOB> = enemyStateMachine.get();

        private enemyN: Enemy;

        private deltaTime:number;




        constructor() {
            super();
            this.instructions = enemyStateMachine.instructions; // setup instructions with the static set
           
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;


          
            // Listen to this component being added to or removed from a node
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(f.EVENT.NODE_DESERIALIZED, this.hndEvent);
        }

        public static get(): ƒAid.StateMachineInstructions<JOB> {
            let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
            setup.transitDefault = enemyStateMachine.transitDefault;
            setup.actDefault = enemyStateMachine.actDefault;

            setup.setAction(JOB.IDLE, <f.General>this.actIdle);
            setup.setAction(JOB.PATROLL,<f.General>this.actPatroll);
            setup.setAction(JOB.ATTACK, <f.General>this.actAttack);
            setup.setAction(JOB.DEAD, <f.General>this.actDead);
            
            return setup;
        }

        private static transitDefault(_machine: enemyStateMachine): void {
            console.log("Transit to", _machine.stateNext);
        }

        private static async actDefault(_machine: enemyStateMachine): Promise<void> {
            console.log("Default");
            
        }

        private static async actPatroll(_machine: enemyStateMachine): Promise<void> {
            console.log("Patrolling");

            _machine.enemyN.patroll(_machine.deltaTime);
        }

        private static async actAttack(_machine: enemyStateMachine): Promise<void> {
            //
            console.log("pipi");
        }


        private static async actDead(_machine: enemyStateMachine): Promise<void> {
            _machine.enemyN.checkEndDeathAnimation();
            console.log("im Dead");
        }



        private static async actIdle(_machine: enemyStateMachine): Promise<void> {
            // if(distance.magnitude <10){
            //
            //  _machine.transit(JOB.ATTACK);
            //} 
            enemyStateMachine.actDefault(_machine);
        }




        // Activate the functions of this component as response to events
        private hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case f.EVENT.COMPONENT_ADD:
                    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
                   
                    this.enemyN = <Enemy>this.node;
                    this.enemyN.getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, this.hndShot);
                    this.transit(JOB.PATROLL);
                    break;
                case f.EVENT.COMPONENT_REMOVE:
                    this.removeEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
                    this.removeEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
                    f.Loop.removeEventListener(f.EVENT.LOOP_FRAME, this.update);
                    break;
                case f.EVENT.NODE_DESERIALIZED:
                   
                    break;
            }
        }
        private hndShot = (_event: f.EventPhysics):void =>{
            console.log("im shot for real");
            if (_event.cmpRigidbody.node.name == "bullet") {
            this.enemyN.setHeadShotAnimation(_event.collisionNormal);
            this.transit(JOB.DEAD);
            this.enemyN.rdgBody.removeEventListener(f.EVENT_PHYSICS.TRIGGER_ENTER, this.hndShot);
            }
        }

        private update = (_event: Event): void => {
            this.act();
            this.deltaTime = f.Loop.timeFrameGame / 1000;
        }

        // protected reduceMutator(_mutator: ƒ.Mutator): void {
        //   // delete properties that should not be mutated
        //   // undefined properties and private fields (#) will not be included by default
        // }
    }
}