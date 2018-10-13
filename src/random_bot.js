var net = require('net');
const utf8 = require('utf8');
const commands =
{
    test: 0,
    createTank: 1,
    despawnTank: 2,
    fire: 3,
    toggleForward: 4,
    toggleReverse:  5,
    toggleLeft: 6,
    toggleRight: 7,
    toggleTurretLeft: 8,
    toggleTurretRight: 9,
    turnTurretToHeading: 10,
    turnToHeading: 11,
    moveForwardDistance: 12,
    moveBackwardsDistance: 13,
    stopAll: 14,
    stopTurn: 15,
    stopMove: 16,
    stopTurret: 17,

    // Server to Clients
    objectUpdate: 18,
    healthPickup: 19,
    ammoPickup: 20,
    snitchPickup: 21,
    destroyed: 22,
    enteredGoal: 23,
    kill: 24,
    snitchAppeared: 25,
    gameTimeUpdate: 26,
    hitDetected: 27,
    successfulHit: 28
}
class SocketManager
{
    constructor(hostname,port)
    {
        this.hostname = hostname
        this.port = port

        console.log("Attempt to connect to http://" + hostname + ":" + port)
        this.client = new net.Socket();

        var ref = this
        this.client.connect(port, hostname, ()=>{
            console.log('Successfully connected to http://' + ref.hostname + ':' + ref.port);

            var cmd = '{"Name":"UnemployedAngus"}';
            var uia = new Uint8Array([1, cmd.length+1]);
            ref.client.write(uia);
            ref.client.write(utf8.encode(cmd));

            var tb = new TankBrain('UnemployedAngus', this);
             // Do some thing my nibb
        });
        // this.client.connect(port, hostname, this.testConnection);

        this.client.on('data', function(data) {
            console.log('Received: ' + typeof(data));
        });

        this.client.on('close', function() {
            console.log('Disconnected from http://' + hostname + ':' + port);

        });
    }

    toggleTurnLeft()
    {
        var uia = new Uint8Array([6, 0]);
        this.client.write(uia);
    }

    fire()
    {
        var uia = new Uint8Array([3, 0]);
        this.client.write(uia);             
    }

    moveForward(amount)
    {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([12, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    toggleTurnRight()
    {
        var uia = new Uint8Array([7, 0]);
        this.client.write(uia);
    }

    toggleForward() {
        var uia = new Uint8Array([4, 0]);
        this.client.write(uia);
    }
}

//Client to Server 

const TEST = 0
const CREATETANK = 1
const DESPAWNTANK = 2
const FIRE = 3
const TOGGLEFORWARD = 4
const TOGGLEREVERSE = 5
const TOGGLELEFT = 6
const TOGGLERIGHT = 7
const TOGGLETURRETLEFT = 8
const TOGGLETURRETRIGHT = 9
const TURNTURRETTOHEADING = 10
const TURNTOHEADING = 11
const MOVEFORWARDDISTANCE = 12
const MOVEBACKWARSDISTANCE = 13
const STOPALL = 14
const STOPTURN = 15
const STOPMOVE = 16
const STOPTURRET = 17

//Server to client

const OBJECTUPDATE = 18
const HEALTHPICKUP = 19
const AMMOPICKUP = 20
const SNITCHPICKUP = 21
const DESTROYED = 22
const ENTEREDGOAL = 23
const KILL = 24
const SNITCHAPPEARED = 25
const GAMETIMEUPDATE = 26
const HITDETECTED = 27
const SUCCESSFULLHIT = 28

const ST_JUSTWALK = 100;

const topBound = 70;
const bottomBound = -70;
const leftBound = -100;
const rightBound = 100;

class TankData {
    constructor(actionParams) {
        this.updateData(actionParams);
    }

    updateData(actionParams) {
        this.x = actionParams["X"];
        this.y = actionParams["Y"];
        this.id = actionParams["Id"];
        this.name = actionParams["Name"];
        this.type = actionParams["Type"];
        this.heading = actionParams["Heading"];
        this.turretHeading = actionParams["TurretHeading"];
        this.health = actionParams["Health"];
        this.ammo = actionParams["Ammo"];
    }
}

class TankBrain {
    constructor(name, socket) {
        console.log('construst started')
        this.name = name;
        this.socket = socket;

        this.data = null;
        this.id = null;
        this.x = null;
        this.y = null;
        this.gameTime = null;
        this.snitchHolder = null;

        this.otherTanks = []

        this.state = ST_JUSTWALK;

        // this.loop().then(r => null)
        // await this.loop()
        console.log('construct ended')
    }

    hasFoundTank(id) {
        filteredTanks = this.otherTanks.filter(tankData => tankData.id == id);
        return filteredTanks.length > 0;
    }

    findTankById(id) {
        filteredTanks = this.otherTanks.filter(tankData => tankData.id == id);
        return filteredTanks[0];
    }

    updateSelfTankData(actionParams) {
        this.data = new TankData(actionParams)
    }

    updateEnemyTankData(actionParams) {
        if( !this.hasFoundTank(actionParams["Id"]) ) {
            this.otherTanks.push(new TankData(actionParams) )
        }
        else{
            this.findTankById.updateData(actionParams);
        }
    }

    fetchEnvironmentData(actionType, actionParams){
        switch(actionType) {
            case OBJECTUPDATE: {
                /*
                    X : float
                    Y : float
                    Id : int
                    Name : str
                    Type : str(enum)
                    Heading : float (degree)
                    TurretHeading : float  (degree)
                    Health : int
                    Ammo : int
                */

                
                // Case self
                if( this.name == actionParams["Name"]){
                    this.updateSelfTankData(actionParams);
                    this.perform();
                }
                // Case enemy
                else if( actionParams["Type"] == "Tank"){
                    updateEnemyTankData(actionParams)
                }
                // Case Bonus : pickups
                else if( actionParams["Type"] == "HealthPickup"){
                    //tbc
                }
                else if(actionParams["Type"] == "AmmoPickup"){
                    //tbc
                }
                else if(actionParams["Type"] == "Snitch"){
                    //tbc
                }

                break;
            } 

            case HEALTHPICKUP: {
                // Update wa pick health laew
                break;
            }

            case AMMOPICKUP: {
                // Update wa pick ammo laew
                break;
            }

            case SNITCHPICKUP: {
                /*
                    Id: int
                */
               this.snitchHolder  = actionParams["Id"]
                // Update state
                // if snitch holder killed -> check from snitch appear
                // if snitch holder get to bank -> clear snitch holder -> update by position
                // Kill snitch holder
                break;
            }

            case DESTROYED: {
                break;
            }

            case ENTEREDGOAL: {
                // Update state
                break;
            }

            case  KILL: {
                break;
            }

            case SNITCHAPPEARED: {
                // No information
                // Turn turret aw
                break;
            }

            case GAMETIMEUPDATE : {
                /*
                    Time : int ( not sure )
                */
               this.gameTime = actionParams["Time"]
                break;
            }

            case HITDETECTED: {

                break;
            }

            case SUCCESSFULLHIT: {
                break;
            }
        } 
    }

    perform(){
        this.socket.fire();
    }
    // async loop() {
    //     while(true){

    //     }
    //     return;
    //     return new Promise((rs, rj)=>{
    //         while(true){
    //             // console.log('most = angus')
    //             // typo = shock.getType();
    //             // paracetamol = shock.getParacetamol();
    //             // this.fetchEnvironmentData(typo, paracetamol);

    //             // if (this.state == ST_JUSTWALK) {

    //             // }

    //             // this.socket.moveForward(10);

    //             // if (this.x <= leftBound) {
    //             //     this.reflectLeft();
    //             // } else if (this.x >= rightBound) {
    //             //     this.reflectRight();
    //             // }

    //             // if (this.y >= topBound) {
    //             //     this.reflectTop();
    //             // } else if (this.y <= bottomBound) {
    //             //     this.reflectBottom();
    //             // }

    //         }
    //     })
    // }

    reflectLeft() {
        var heading = this.data.heading;
        if (heading <= 180) {
            heading = 180 - heading;
        } else if (heading > 180) {
            heading = 270 + (heading - 180);
        }
        if (heading < 0) heading += 360;

        //Turn To Heading (heading)
    }

    reflectRight() {
        var heading = this.data.heading;
        if (heading <= 90) {
            heading = 180 - heading;
        } else if (heading > 270) {
            heading = 180 + (360 - heading);
        }

        //Turning To Heading
    }

    reflectTop() {
        var heading = this.data.heading;
        if (heading <= 90) {
            heading = 360 - (90 - heading);
        } else if (heading > 90) {
            heading = 360 - heading;
        }

    }

    reflectBottom() {
        var heading = this.data.heading;
        if (heading <= 270) {
            heading = 180 - (heading - 180);
        } else if (heading > 270) {
            heading = 360 - heading;
        }
    }

    think(actionType, actionParams) {
        this.fetchEnvironmentData(actionType, actionParams);

    }
}

// o = {Name: "Charn",
//     ID:"KAK"};

// inp = "{'Id': -294, 'Name': 'ManualTank', 'Type': 'Tank', 'X': 8.277814865112305, 'Y': -25.688796997070312, 'Heading': 138.75985717773438, 'TurretHeading': 138.75985717773438, 'Health': 5, 'Ammo': 10}"
// inp2 = "{'Id': -342, 'Name': '', 'Type': 'HealthPickup', 'X': -24.239286422729492, 'Y': 30.22211265563965, 'Heading': 0.0, 'TurretHeading': 0.0, 'Health': 0, 'Ammo': 0}";

// str = "{'Id': -294, 'Name': 'ManualTank', 'Type': 'Tank', 'X': 8.277814865112305, 'Y': -25.688796997070312, 'Heading': 138.75985717773438, 'TurretHeading': 138.75985717773438, 'Health': 5, 'Ammo': 10}".replace(/'/g,"\"");
// obj = JSON.parse(str)

// var td = new TankData(obj);
// console.log(td);

// console.log(SocketManager)
var sam = new SocketManager('127.0.0.1', 8052)