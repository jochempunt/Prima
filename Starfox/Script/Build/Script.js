"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let cmpCamera;
    document.addEventListener("interactiveViewportStarted", start);
    let rgdBodyShip;
    function lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
    Script.lerp = lerp;
    function start(_event) {
        viewport = _event.detail;
        let branch = viewport.getBranch();
        rgdBodyShip = branch.getChildrenByName("spaceship")[0].getComponent(ƒ.ComponentRigidbody);
        console.log(rgdBodyShip);
        cmpCamera = viewport.camera;
        let posShip = rgdBodyShip.getPosition();
        let image = document.createElement("img");
        image.src = "./images/aim.png";
        image.alt = "not found";
        image.classList.add("center");
        document.body.prepend(image);
        //document.body.getElementsByTagName("canvas")[0].classList.add("noCursor");
        cmpCamera.mtxPivot.translate(new ƒ.Vector3(0, 2, -15));
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
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
            this.pitchF = 20;
            this.rollF = 20;
            this.yawf = 20;
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
                    this.rollLeft();
                }
                if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
                    this.rollRight();
                }
                this.rgdBodySpaceship.applyTorque(new ƒ.Vector3(0, this.xAxis * -10, 0));
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
            this.relativeZ = ƒ.Vector3.TRANSFORMATION(new ƒ.Vector3(0, 0, 5), ƒ.Matrix4x4.ROTATION(this.node.mtxWorld.rotation));
            this.relativeY = ƒ.Vector3.TRANSFORMATION(new ƒ.Vector3(0, 5, 0), ƒ.Matrix4x4.ROTATION(this.node.mtxWorld.rotation));
            this.relativeX = ƒ.Vector3.TRANSFORMATION(new ƒ.Vector3(5, 0, 0), ƒ.Matrix4x4.ROTATION(this.node.mtxWorld.rotation));
        }
        backwards() {
            this.rgdBodySpaceship.applyForce(ƒ.Vector3.SCALE(this.relativeZ, -this.forwardthrust));
        }
        thrust() {
            let scaledRotatedDirection = ƒ.Vector3.SCALE(this.relativeZ, this.forwardthrust);
            this.rgdBodySpaceship.applyForce(scaledRotatedDirection);
        }
        rollLeft() {
            this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeZ, -1));
        }
        rollRight() {
            this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeZ, 1));
        }
    }
    // Register the script as component for use in the editor via drag&drop
    SpaceShipMovement.iSubclass = ƒ.Component.registerSubclass(SpaceShipMovement);
    Script.SpaceShipMovement = SpaceShipMovement;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map