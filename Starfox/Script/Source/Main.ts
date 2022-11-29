namespace Script {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  let viewport: f.Viewport;
  let cmpCamera: f.ComponentCamera;

  document.addEventListener("interactiveViewportStarted", <EventListener>start);






  let rgdBodyShip: f.ComponentRigidbody;


  export function lerp(start: number, end: number, amt: number): number {
    return (1 - amt) * start + amt * end;
  }



  function generateCubes(n: number): void { //f.Node {

    let cubes: f.Node[];
    let cubeMesh: f.MeshCube = new f.MeshCube("cubeMesh");

    let material: f.Material = new f.Material("cubeShader", f.ShaderFlat);
    let randZ: number;
    let randY: number;
    let randX: number;
    for (let i: number = 0; i < n; i++) {
      let nodeCube: f.Node = new f.Node("cube" + i);
      randX = f.random.getRange(-240, 240);
      randY = f.random.getRange(15, 30);
      randZ = f.random.getRange(-240, 240);

      let materialComp: f.ComponentMaterial = new f.ComponentMaterial(material);
      let componentRigidbody: f.ComponentRigidbody = new f.ComponentRigidbody();
      componentRigidbody.effectGravity = 0;
      componentRigidbody.mass = 0.1;
      componentRigidbody.setScaling(new f.Vector3(5, 5, 5));
      console.log("Rigidbody:");
      console.log(componentRigidbody);
      let componentMesh: f.ComponentMesh = new f.ComponentMesh(cubeMesh);
      let componentTransform: f.ComponentTransform = new f.ComponentTransform();
      componentTransform.mtxLocal.translation = new f.Vector3(randX, randY, randZ);
      componentTransform.mtxLocal.scale(new f.Vector3(5, 5, 5));
      nodeCube.addComponent(componentMesh);
      nodeCube.addComponent(materialComp);
      nodeCube.addComponent(componentTransform);
      nodeCube.addComponent(componentRigidbody);
      viewport.getBranch().addChild(nodeCube);
    }

  }


  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    let branch: f.Node = viewport.getBranch();
    rgdBodyShip = branch.getChildrenByName("spaceship")[0].getComponent(f.ComponentRigidbody);
    console.log(rgdBodyShip);




    console.log(branch);

    cmpCamera = viewport.camera;
    let posShip = rgdBodyShip.getPosition();

    //cmpCamera.mtxPivot.translation = new f.Vector3(posShip.x,posShip.y+2,posShip.z-30)


    let image: HTMLImageElement = document.createElement("img");
    image.src = "./images/aim.png";
    image.alt = "not found";
    image.classList.add("center");

    document.body.prepend(image);

    //document.body.getElementsByTagName("canvas")[0].classList.add("noCursor");

    cmpCamera.mtxPivot.translate(new f.Vector3(0, 2, -15));

    generateCubes(12);



    

    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }



  function updateCamera(): void {
    cmpCamera.mtxWorld.rotation = new f.Vector3(0,cmpCamera.mtxWorld.rotation.y,0);
  }


  function update(_event: Event): void {
    f.Physics.simulate();  // if physics is included and used
    viewport.draw();
    f.AudioManager.default.update();
    updateCamera();
    //rgdBodyShip.applyTorque(new ƒ.Vector3(0,0,0) )
    // rotational impulse
    //linear impulse


    //rgdBodyShip.applyForce(new ƒ.Vector3(0,0,4))
  }








}