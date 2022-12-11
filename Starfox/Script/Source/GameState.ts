namespace Script {
    import f = FudgeCore;
    import fui = FudgeUserInterface;
    export class GameState extends f.Mutable {
        protected reduceMutator(_mutator: f.Mutator): void { /**/ }


        public height: number;
        public velocity: number;
        public fuel:number = 20;
        private controller: fui.Controller;

        constructor() {
            super();
            this.controller = new fui.Controller(this, document.getElementById("vui"));
            console.log(this.controller);
        }



    }

























}