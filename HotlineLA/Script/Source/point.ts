namespace HotlineLA{
    import f = FudgeCore;





    export class Point{

        public gameCoordinates:f.Vector3;
        public divElement:HTMLDivElement;

        constructor(_gCoordinates:f.Vector3,_divElement:HTMLDivElement){
            this.gameCoordinates = _gCoordinates;
            this.divElement = _divElement;
        }




    }



}