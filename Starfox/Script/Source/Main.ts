namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let cmpCamera: ƒ.ComponentCamera;

  document.addEventListener("interactiveViewportStarted", <EventListener>start);


  let rgdBodyShip: ƒ.ComponentRigidbody;


  export function lerp (start:number, end:number, amt:number):number{
    return (1-amt)*start+amt*end;
  }

 

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    let branch: ƒ.Node = viewport.getBranch();
    rgdBodyShip = branch.getChildrenByName("spaceship")[0].getComponent(ƒ.ComponentRigidbody);
    console.log(rgdBodyShip);
    


    cmpCamera = viewport.camera;
    let posShip = rgdBodyShip.getPosition();

    let image: HTMLImageElement = document.createElement("img");
    image.src = "./Images/aim.png";
    image.alt = "not found";
    image.classList.add("center");

    document.body.prepend(image);

    //document.body.getElementsByTagName("canvas")[0].classList.add("noCursor");

    cmpCamera.mtxPivot.translate(new ƒ.Vector3(0,2,-15));


    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }



 


  function update(_event: Event): void {
    ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  
    //rgdBodyShip.applyTorque(new ƒ.Vector3(0,0,0) )
    // rotational impulse
    //linear impulse


    //rgdBodyShip.applyForce(new ƒ.Vector3(0,0,4))
  }




 



}