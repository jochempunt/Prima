namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization

    enum JOB {
        IDLE,ATTACK,DEAD
    }

    export class enemyStateMachine extends ƒAid.ComponentStateMachine<JOB> {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(enemyStateMachine);
        private static instructions: ƒAid.StateMachineInstructions<JOB> = enemyStateMachine.get();
      
        private turretHead: ƒ.Node;
        private barrel:ƒ.Node;




        constructor() {
            super();
            this.instructions = enemyStateMachine.instructions; // setup instructions with the static set

            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;

            // Listen to this component being added to or removed from a node
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
            this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
        }

        public static get(): ƒAid.StateMachineInstructions<JOB> {
            let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
            setup.transitDefault = enemyStateMachine.transitDefault;
            setup.actDefault = enemyStateMachine.actDefault;
            setup.setAction(JOB.IDLE, <ƒ.General>this.actIdle);
            setup.setAction(JOB.ATTACK,<ƒ.General>this.actAttack);
            return setup;
        }

        private static transitDefault(_machine: enemyStateMachine): void {
            console.log("Transit to", _machine.stateNext);
        }

        private static async actDefault(_machine: enemyStateMachine): Promise<void> {
           console.log("Attack");
        }

        private static async actAttack(_machine: enemyStateMachine): Promise<void> {
            //
            console.log("pipi");
         }

        private static async actIdle(_machine: enemyStateMachine): Promise<void> {
           _machine.turretHead.mtxLocal.rotateY(2);
      
          // if(distance.magnitude <10){
        //
          //  _machine.transit(JOB.ATTACK);
           //} 
           enemyStateMachine.actDefault(_machine);



        }
      
      


        // Activate the functions of this component as response to events
        private hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case ƒ.EVENT.COMPONENT_ADD:
                    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    this.transit(JOB.IDLE);
                    break;
                case ƒ.EVENT.COMPONENT_REMOVE:
                    this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
                    this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
                    ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                    break;
                case ƒ.EVENT.NODE_DESERIALIZED:
                   this.turretHead = this.node.getChild(0);

                    break;
            }
        }

        private update = (_event: Event): void => {
            this.act();
        }

        // protected reduceMutator(_mutator: ƒ.Mutator): void {
        //   // delete properties that should not be mutated
        //   // undefined properties and private fields (#) will not be included by default
        // }
    }
}