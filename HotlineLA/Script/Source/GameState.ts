namespace HotlineLA {
    import f = FudgeCore;
    import fui = FudgeUserInterface;
    export class GameState extends f.Mutable {
        protected reduceMutator(_mutator: f.Mutator): void { /**/ }


        public bulletCount:number;
        public points:number;
        public multiplier:number;
        private controller: fui.Controller;

        constructor() {
            super();
            this.controller = new fui.Controller(this, document.getElementById("vui"));
            console.log(this.controller);
            console.log("mutator");
            console.log(this.getMutator());
        }



    }

























}