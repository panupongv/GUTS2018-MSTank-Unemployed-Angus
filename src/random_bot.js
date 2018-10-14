var net = require('net');
const utf8 = require('utf8');
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

const STATE_GOING_TO = 100;
const STATE_FIRING_TO = 101;
const TSTATE_SEARCH = 200;
const TSTATE_FOLLOW = 201;

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
        this.updateTime = Date.now();
    }

    isOutDate(){
        return (Date.now() - this.updateTime) >= 500;
    }
}

class Calculator {
    constructor(mainTank){
        this.mainTank = mainTank
    }

    enoughHealth(){
        return this.mainTank.data.health >= 3
    }

    enoughAmmo(ammo){
        return this.mainTank.data.ammo >= 3
    }

    distance(x1,x2,y1,y2){
        var dis = Math.sqrt((x1 - x2)**2 + (y1 - y2)**2)
        return dis
    }

    findNearestByType(type){
        var obj = null
        var nearest = 10000000000
        switch(type){
            case "tank" : {
                var min = null
                for( var i=0; i< this.otherTanks.length; i++){
                    min = this.distance(this.otherTanks[i].x,this.mainTank.x,this.otherTanks[i].y,this.mainTank.y)
                    if ( min < nearest ){
                        nearest = min
                        obj = this.otherTanks[i]
                    }
                }
                break;
            }
            case "healthPickup" : {
                var min = null
                for( var i=0; i< this.healthPickups.length; i++){
                    min = this.distance(this.healthPickups[i].x,this.mainTank.x,this.healthPickups[i].y,this.mainTank.y)
                    if ( min < nearest ){
                        nearest = min
                        obj = this.healthPickups[i]
                    }
                }
                break;
            }
            case "ammoPickup" : {
                var min = null
                for( var i=0; i< this.ammoPickups.length; i++){
                    min = this.distance(this.ammoPickups[i].x,this.mainTank.x,this.ammoPickups[i].y,this.mainTank.y)
                    if ( min < nearest ){
                        nearest = min
                        obj = this.ammoPickups[i]
                    }
                }
                break;
            }
        }
        return obj
    }

    currentX(){
        return this.mainTank.data.x
    }

    currentY(){
        return this.mainTank.data.y
    }

    degreeBetween(fx,fy,tx,ty){
        var dx = tx-fx;
        var dy = ty - fy;
        // angle in radians
        var angleRadians = Math.atan2(dx, dy);

        // angle in degrees
        var angleDeg = Math.atan2(dx, dy) * 180 / Math.PI + 180 + 90;
        angleDeg = angleDeg > 360 ? angleDeg - 360 : angleDeg
        // if(angleDeg > 180)
        //     angleDeg = -180 + (angleDeg-180)
        return angleDeg
    }
}

class TankBrain {
    constructor(name, socket) {
        console.log('construst started')
        this.name = name;
        this.socket = socket;

        this.data = null;
        this.gameTime = null;
        this.snitchHolder = null;

        this.otherTanks = []
        this.healthPickups = []
        this.ammoPickups = []

        this.tState = TSTATE_SEARCH;

        this.turretFollowing = null;

        this.turningLeft = false;
        this.turningRight = false;

        this.calculator = new Calculator(this)

        this.killStack = 0;

        // this.loop().then(r => null)
        // await this.loop()
        console.log('construct ended')
    }

    hasFoundTank(id) {
        var filteredTanks = this.otherTanks.filter(tankData => tankData.id == id);
        return filteredTanks.length > 0;
    }

    findTankById(id) {
        var filteredTanks = this.otherTanks.filter(tankData => tankData.id == id);
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
            this.findTankById(actionParams["Id"]).updateData(actionParams);
        }
    }

    removeOutDateData() {
        this.otherTanks = this.otherTanks.filter((a) => a.isOutDate());
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
                    this.removeOutDateData();
                    this.perform();
                }
                // Case enemy
                else if( actionParams["Type"] == "Tank"){
                    this.updateEnemyTankData(actionParams)
                    if (this.tState == TSTATE_SEARCH) {
                        this.tState = TSTATE_FOLLOW;
                        this.turretFollowing = this.findTankById(actionParams["Id"]);

                    }
                    this.perform();
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

            case KILL: {
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
        switch(this.tState) {
            case TSTATE_SEARCH: {
                this.socket.toggleTurretLeft();
                // this.socket.turnTurretToHeading(this.data.heading + 45)
                break;
            }
            case TSTATE_FOLLOW: {
                var degree = this.calculator.degreeBetween(this.data.x, this.data.y, this.turretFollowing.x, this.turretFollowing.y)
                console.log(this.data.turretHeading)
                console.log(degree)
                console.log(this.data.x + " " + this.data.y + " " + this.turretFollowing.x + " " + this.turretFollowing.y);
                this.socket.turnTurretToHeading(degree);
                break;
            }
        }
    }

    action_fire_nearest_enemy() {
        var nearestEnemy = this.calculator.findNearestByType("tank");

        if(nearestEnemy == null) {
            this.action_look_at(nearestEnemy.x, nearestEnemy.y)
            return;
        }

        this.socket.fire()
    }

    action_look_at(x,y) {
        var myX = this.calculator.currentX();
        var myY = this.calculator.currentY();
        var degree = this.calculator.degreeBetween(x, y, myX, myY);
        socket.turnTurretToHeading(degree);
    }

    action_go_to(x,y) {
        //todo 17chuchu
        var myX = this.calculator.currentX();
        var myY = this.calculator.currentY();
        var degree = this.calculator.degreeBetween(x, y, myX, myY);
        if(degree > -0.01 && degree < 0.01)
        {
            socket.turnToHeading(degree);
            return
        }

        var distance = Math.sqrt((x - y)**2 + (myX - myY)**2)
        if(distance > -2 && distance < 2)
        {
            socket.moveForward(1000);
            return
        }

        socket.stopMove();

    }

    action_go_to_left_bank(){
        this.action_go_to(100,0)
        //todo 17chuchu
    }

    action_go_to_right_bank(){
        this.action_go_to(-100,0)
        //todo 17chuchu
    }

    action_go_to_nearest_bank(){
        var distBankLeft = this.calculator.degreeBetween(this.calculator.currentX(),this.calculator.currentY(),100,0)
        var distBankRight = this.calculator.degreeBetween(this.calculator.currentX(),this.calculator.currentY(),-100,0)
        //todo 17chuchu
        if(distBankLeft > distBankRight)
        {
            this.action_go_to_right_bank()
            return 
        }
        this.action_go_to_left_bank()
    }

    //guide = https://github.com/NickMcCrea/MSTanks/wiki/Arena-Layout-and-Useful-Coordinates

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

module.exports = TankBrain;