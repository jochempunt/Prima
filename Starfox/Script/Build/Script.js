"use strict";
var Script;
(function (Script) {
    var f = FudgeCore;
    var fui = FudgeUserInterface;
    class GameState extends f.Mutable {
        constructor() {
            super();
            this.fuel = 20;
            this.controller = new fui.Controller(this, document.getElementById("vui"));
            console.log(this.controller);
            console.log("mutator");
            console.log(this.getMutator());
        }
        reduceMutator(_mutator) { }
    }
    Script.GameState = GameState;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    let cmpCamera;
    document.addEventListener("interactiveViewportStarted", start);
    let rgdBodyShip;
    let terrainMesh;
    let nodeTerrain;
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
            let componentMesh = new f.ComponentMesh(cubeMesh);
            let componentTransform = new f.ComponentTransform();
            componentTransform.mtxLocal.translation = new f.Vector3(randX, randY, randZ);
            componentTransform.mtxLocal.scale(new f.Vector3(5, 5, 5));
            nodeCube.addComponent(componentMesh);
            nodeCube.addComponent(materialComp);
            nodeCube.addComponent(componentTransform);
            nodeCube.addComponent(componentRigidbody);
            Script.viewport.getBranch().addChild(nodeCube);
        }
    }
    function start(_event) {
        Script.gameState = new Script.GameState();
        Script.viewport = _event.detail;
        let branch = Script.viewport.getBranch();
        Script.shipNode = branch.getChildrenByName("spaceship")[0];
        rgdBodyShip = Script.shipNode.getComponent(f.ComponentRigidbody);
        console.log(rgdBodyShip);
        f.Physics.settings.solverIterations = 5000;
        nodeTerrain = branch.getChildrenByName("terrain")[0];
        Script.cmpMeshTerrain = nodeTerrain.getComponent(f.ComponentMesh);
        terrainMesh = Script.cmpMeshTerrain.mesh;
        nodeTerrain.getComponent(f.ComponentCamera);
        cmpCamera = Script.viewport.camera;
        let posShip = rgdBodyShip.getPosition();
        //cmpCamera.mtxPivot.translation = new f.Vector3(posShip.x,posShip.y+2,posShip.z-30)
        let image = document.createElement("img");
        image.src = "./images/aim.png";
        image.alt = "not found";
        image.classList.add("center");
        document.body.prepend(image);
        //document.body.getElementsByTagName("canvas")[0].classList.add("noCursor");
        // cmpCamera.mtxPivot.translate(new f.Vector3(0, 2, -35));
        generateCubes(12);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function updateCamera() {
        cmpCamera.mtxWorld.rotation = new f.Vector3(0, cmpCamera.mtxWorld.rotation.y, 0);
    }
    function update(_event) {
        f.Physics.simulate(); // if physics is included and used
        Script.viewport.draw();
        f.AudioManager.default.update();
        updateCamera();
        f.PHYSICS_DEBUGMODE.JOINTS_AND_COLLIDER;
        Script.viewport.physicsDebugMode = 2;
        //console.log(terrainMesh.getTerrainInfo(shipNode.mtxLocal.translation,cmpMeshTerrain.mtxWorld).distance);
        //rgdBodyShip.applyTorque(new ƒ.Vector3(0,0,0) )
        // rotational impulse
        //linear impulse
        //rgdBodyShip.applyForce(new ƒ.Vector3(0,0,4))
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class SensorScript extends f.ComponentScript {
        //cmpMeshTerrain: f.ComponentMesh;
        //private terrainMesh: f.MeshTerrain;  //= <f.MeshTerrain>cmpMeshTerrain.mesh;
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "SensorScript added to ";
            this.strafeThrust = 2000;
            this.forwardthrust = 5000;
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        f.Debug.log(this.message, this.node);
                        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
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
            //Todo : Camera mit joints? vllt mit universelJoint
            this.update = () => {
                if (!Script.cmpMeshTerrain) {
                    return;
                }
                if (this.node.getParent() != null) {
                    let terrainInfo = Script.cmpMeshTerrain.mesh.getTerrainInfo(this.node.getParent().mtxWorld.translation, Script.cmpMeshTerrain.mtxWorld);
                    //console.log(this.node.getParent().name + ": " + terrainInfo.distance);
                    if (terrainInfo.distance <= 0) {
                        this.node.dispatchEvent(new Event("SensorHit", { bubbles: true }));
                    }
                }
                else {
                    //console.log(this.node);
                }
            };
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    SensorScript.iSubclass = f.Component.registerSubclass(SensorScript);
    Script.SensorScript = SensorScript;
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
                        // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                        console.log(this.node);
                        window.addEventListener("mousemove", this.handleMouse);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        this.audioCrash = new ƒ.Audio("./images/gong.mp3");
                        this.node.addComponent(new ƒ.ComponentAudio(this.audioCrash));
                        this.rgdBodySpaceship.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, this.hndCollision);
                        this.rgdBodySpaceship.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, this.hndTrigger);
                        this.node.addEventListener("SensorHit", this.hndCollision);
                        this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.update);
                        this.initAnimation();
                        // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                        break;
                }
            };
            this.initAnimation = () => {
                let animseq = new ƒ.AnimationSequence();
                animseq.addKey(new ƒ.AnimationKey(0, 0));
                animseq.addKey(new ƒ.AnimationKey(1000, 1));
                animseq.addKey(new ƒ.AnimationKey(2000, 0));
                let animStructure = {
                    components: {
                        ComponentMaterial: [
                            {
                                "ƒ.ComponentMaterial": {
                                    clrPrimary: {
                                        r: animseq
                                    }
                                }
                            }
                        ]
                    }
                };
                let animation = new ƒ.Animation("testAnimation", animStructure, 30);
                animation.setEvent("event123", 1000);
                let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
                cmpAnimator.scale = 1;
                this.node.addComponent(cmpAnimator);
                cmpAnimator.activate(true);
                cmpAnimator.addEventListener("event123", this.hndCollision);
            };
            this.hndCollision = () => {
                console.log("bumm");
                //this.node.getComponent(ƒ.ComponentAudio).play(true);
                //this.node.getComponent(ƒ.ComponentAudio).volume = 0.5;
            };
            this.hndTrigger = (event) => {
                console.log("entered a pyramid");
                console.log(event);
                this.rgdBodySpaceship.applyLinearImpulse(ƒ.Vector3.SCALE(this.relativeZ, -5000));
            };
            //Todo : Camera mit joints? vllt mit universelJoint
            this.update = () => {
                if (!Script.gameState) {
                    return;
                }
                Script.gameState.height = this.node.mtxWorld.translation.y;
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
                //this.rgdBodySpaceship.applyTorque(ƒ.Vector3.SCALE(this.relativeY,this.xAxis * -0.5))
                this.rgdBodySpaceship.applyTorque(new ƒ.Vector3(0, this.xAxis * -10, 0));
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
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["ATTACK"] = 1] = "ATTACK";
    })(JOB || (JOB = {}));
    class StateMachine extends ƒAid.ComponentStateMachine {
        constructor() {
            super();
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
                switch (_event.type) {
                    case "componentAdd" /* COMPONENT_ADD */:
                        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        this.transit(JOB.IDLE);
                        break;
                    case "componentRemove" /* COMPONENT_REMOVE */:
                        this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                        this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                        ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        break;
                    case "nodeDeserialized" /* NODE_DESERIALIZED */:
                        this.turretHead = this.node.getChild(0);
                        break;
                }
            };
            this.update = (_event) => {
                this.act();
            };
            this.instructions = StateMachine.instructions; // setup instructions with the static set
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = StateMachine.transitDefault;
            setup.actDefault = StateMachine.actDefault;
            setup.setAction(JOB.IDLE, this.actIdle);
            setup.setAction(JOB.ATTACK, this.actAttack);
            return setup;
        }
        static transitDefault(_machine) {
            console.log("Transit to", _machine.stateNext);
        }
        static async actDefault(_machine) {
            console.log("Attack");
        }
        static async actAttack(_machine) {
            //
            console.log("pipi");
        }
        static async actIdle(_machine) {
            _machine.turretHead.mtxLocal.rotateY(2);
            let distance = ƒ.Vector3.DIFFERENCE(Script.shipNode.mtxWorld.translation, _machine.node.mtxWorld.translation);
            if (distance.magnitude < 10) {
                _machine.transit(JOB.ATTACK);
            }
            StateMachine.actDefault(_machine);
        }
    }
    StateMachine.iSubclass = ƒ.Component.registerSubclass(StateMachine);
    StateMachine.instructions = StateMachine.get();
    Script.StateMachine = StateMachine;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map