"use strict";
var Script;
(function (Script) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let viewport;
    let cmpCamera;
    document.addEventListener("interactiveViewportStarted", start);
    let rgdBodyShip;
    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
    Script.lerp = lerp;
    function generateCubes(n) {
        let cubes;
        let cubeMesh = new f.MeshCube("cubeMesh");
        let material = new f.Material("cubeShader", f.ShaderFlat);
        let randZ;
        let randY;
        let randX;
        for (let i = 0; i < n; i++) {
            let nodeCube = new f.Node("cube" + i);
            randX = f.random.getRange(-240, 240);
            randY = f.random.getRange(15, 30);
            randZ = f.random.getRange(-240, 240);
            let materialComp = new f.ComponentMaterial(material);
            let componentRigidbody = new f.ComponentRigidbody();
            componentRigidbody.effectGravity = 0;
            componentRigidbody.mass = 0.1;
            componentRigidbody.setScaling(new f.Vector3(5, 5, 5));
            console.log("Rigidbody:");
            console.log(componentRigidbody);
            let componentMesh = new f.ComponentMesh(cubeMesh);
            let componentTransform = new f.ComponentTransform();
            componentTransform.mtxLocal.translation = new f.Vector3(randX, randY, randZ);
            componentTransform.mtxLocal.scale(new f.Vector3(5, 5, 5));
            nodeCube.addComponent(componentMesh);
            nodeCube.addComponent(materialComp);
            nodeCube.addComponent(componentTransform);
            nodeCube.addComponent(componentRigidbody);
            viewport.getBranch().addChild(nodeCube);
        }
    }
    function start(_event) {
        viewport = _event.detail;
        let branch = viewport.getBranch();
        rgdBodyShip = branch.getChildrenByName("spaceship")[0].getComponent(f.ComponentRigidbody);
        console.log(rgdBodyShip);
        console.log(branch);
        cmpCamera = viewport.camera;
        let posShip = rgdBodyShip.getPosition();
        //cmpCamera.mtxPivot.translation = new f.Vector3(posShip.x,posShip.y+2,posShip.z-30)
        let image = document.createElement("img");
        image.src = "./images/aim.png";
        image.alt = "not found";
        image.classList.add("center");
        document.body.prepend(image);
        //document.body.getElementsByTagName("canvas")[0].classList.add("noCursor");
        cmpCamera.mtxPivot.translate(new f.Vector3(0, 2, -15));
        generateCubes(12);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function updateCamera() {
        cmpCamera.mtxWorld.rotation = new f.Vector3(0, cmpCamera.mtxWorld.rotation.y, 0);
    }
    function update(_event) {
        f.Physics.simulate(); // if physics is included and used
        viewport.draw();
        f.AudioManager.default.update();
        updateCamera();
        //rgdBodyShip.applyTorque(new ƒ.Vector3(0,0,0) )
        // rotational impulse
        //linear impulse
        //rgdBodyShip.applyForce(new ƒ.Vector3(0,0,4))
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class SpaceShipMovement extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "SpaceShipMovement added to ";
            this.strafeThrust = 2000;
            this.forwardthrust = 5000;
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Debug.log(this.message, this.node);
                        this.rgdBodySpaceship = this.node.getComponent(ƒ.ComponentRigidbody);
                        // this.rgdBodySpaceship.addVelocity(new ƒ.Vector3(0, 0, 10));
                        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        console.log(this.node);
                        window.addEventListener("mousemove", this.handleMouse);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            this.update = () => {
                this.setRelativeAxes();
                if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W])) {
                    this.thrust();
                }
                if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) {
                    this.backwards();
                }
                if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
                    this.roll(-1);
                }
                if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
                    this.roll(1);
                }
                this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeY, this.xAxis * -0.5));
                //this.rgdBodySpaceship.applyTorque(new ƒ.Vector3(0, this.xAxis * -10, 0));
                //this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeX, this.yAxis * 1.5));
                this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeX, this.yAxis * 1.5));
            };
            this.width = 0;
            this.height = 0;
            this.xAxis = 0;
            this.yAxis = 0;
            this.handleMouse = (e) => {
                this.width = window.innerWidth;
                this.height = window.innerHeight;
                let mousePositionY = e.clientY;
                let mousePositionX = e.clientX;
                this.xAxis = 2 * (mousePositionX / this.width) - 1;
                this.yAxis = 2 * (mousePositionY / this.height) - 1;
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        setRelativeAxes() {
            this.relativeZ = this.node.mtxWorld.getZ();
            this.relativeZ.scale(5);
            this.relativeY = this.node.mtxWorld.getY();
            this.relativeY.scale(5);
            this.relativeX = this.node.mtxWorld.getX();
            this.relativeY.scale(5);
        }
        backwards() {
            this.rgdBodySpaceship.applyForce(ƒ.Vector3.SCALE(this.relativeZ, -this.forwardthrust));
        }
        thrust() {
            let scaledRotatedDirection = ƒ.Vector3.SCALE(this.relativeZ, this.forwardthrust);
            this.rgdBodySpaceship.applyForce(scaledRotatedDirection);
        }
        roll(dir) {
            this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeZ, dir));
        }
    }
    // Register the script as component for use in the editor via drag&drop
    SpaceShipMovement.iSubclass = ƒ.Component.registerSubclass(SpaceShipMovement);
    Script.SpaceShipMovement = SpaceShipMovement;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map