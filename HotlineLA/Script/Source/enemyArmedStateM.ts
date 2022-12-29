namespace HotlineLA {
    import f = FudgeCore;
    import ƒAid = FudgeAid;
    f.Project.registerScriptNamespace(HotlineLA);  // Register the namespace to FUDGE for serialization

    enum JOB {
        IDLE, PATROLL, ATTACK, DEAD
    }

    export class enemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        public static readonly iSubclass: number = f.Component.registerSubclass(enemyStateMachine);
        private static instructions: ƒAid.StateMachineInstructions<JOB> = enemyStateMachine.get();

        private enemy: Enemy;

        private deltaTime: number;


        private timer: f.Timer = null;

        private IDLE_TIME: number = 3000;
        private PATROLL_TIME: number = 5000;


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
            setup.setAction(JOB.PATROLL, <f.General>this.actPatroll);
            setup.setAction(JOB.ATTACK, <f.General>this.actAttack);
            setup.setAction(JOB.DEAD, <f.General>this.actDead);

            return setup;
        }

        private static transitDefault(_machine: enemyStateMachine): void {
            console.log("Transit to", _machine.stateNext);
        }

        private static async actDefault(_machine: enemyStateMachine): Promise<void> {

            if (_machine.enemy.isPlayerInFOV()) {
                _machine.transit(JOB.ATTACK);
            }

        }

        private static async actPatroll(_machine: enemyStateMachine): Promise<void> {
            console.log("Patrolling");

            if (_machine.timer == null) {
                _machine.timer = new f.Timer(new f.Time, _machine.PATROLL_TIME, 1, _machine.hndSwitchToIdle);
            }
            if (_machine.enemy.isPlayerInFOV()) {
                _machine.transit(JOB.ATTACK);
            }
            _machine.enemy.patroll(_machine.deltaTime);
        }

        private static async actAttack(_machine: enemyStateMachine): Promise<void> {

            if (_machine.timer != null) {
                _machine.timer.active = false;
                _machine.timer = null;
            }

           if(avatarCmp.dead){
            _machine.transit(JOB.IDLE);
           }
                _machine.enemy.chasePlayer();
            
               
            console.log("Attack");

        }


        private static async actDead(_machine: enemyStateMachine): Promise<void> {
            if (_machine.timer != null) {
                _machine.timer = null;
            }
            _machine.enemy.cleanUpAfterDeath();
            console.log("im Dead");
        }



        private static async actIdle(_machine: enemyStateMachine): Promise<void> {
            // if(distance.magnitude <10){
            //
            //  _machine.transit(JOB.ATTACK);
            //}
            if (_machine.timer == null) {
                _machine.timer = new f.Timer(new f.Time, _machine.IDLE_TIME, 1, _machine.hndSwitchToPatroll);
            }
            enemyStateMachine.actDefault(_machine);
        }






        // Activate the functions of this component as response to events
        private hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case f.EVENT.COMPONENT_ADD:
                    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);

                    this.enemy = <Enemy>this.node;

                    this.transit(JOB.IDLE);
                    this.timer = new f.Timer(new f.Time, this.IDLE_TIME, 1, this.hndSwitchToPatroll);
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



        public resetState(): void {
            this.transit(JOB.IDLE);
        }

        public hndShotDead = (normal: f.Vector3): void => {


            this.enemy.handleHeadshotCollision(normal);
            if (this.timer != null) {
                this.timer.active = false;
            }

            this.transit(JOB.DEAD);

        }


        private update = (_event: Event): void => {
            this.act();
            this.deltaTime = f.Loop.timeFrameGame / 1000;






        }

        private hndSwitchToPatroll = (): void => {
            this.transit(JOB.PATROLL);
            this.timer = null;
        };

        private hndSwitchToIdle = (): void => {
            this.transit(JOB.IDLE);
            this.timer = null;
        };

        // protected reduceMutator(_mutator: ƒ.Mutator): void {
        //   // delete properties that should not be mutated
        //   // undefined properties and private fields (#) will not be included by default
        // }
    }
}