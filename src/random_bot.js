var net = require('net');
const utf8 = require('utf8');
//Client to Server
const Calculator = require('./calculator.js');
const TankData = require('./tankdata.js');
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

const STATE_SCOUT = 100;
const STATE_GUARDIAN = 101;
const STATE_GET_HEAL = 102;
const STATE_SNITCHER = 103;

const TSTATE_SEARCH = 200;
const TSTATE_FOLLOW = 201;
// const TSTATE_STILL = 202;

class Point {
    constructor(x, y)
    {
        this.x =x
        this.y = y
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

        this.moveAroundRoute = [[-20,-50],[-20,50],[20,50],[20,-50]]
        this.currentCoverPoint = 0;

        this.mState = STATE_SCOUT;
        this.tState = TSTATE_SEARCH;

        this.going_to = false;
        this.turretFollowing = null;//new Point(x,y)
        this.trackedPickup = null;
        // this.trackedRect = null;
        this.rectIndex = 0;

        this.calculator = new Calculator(this);

        this.killStack = 0;

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
        this.otherTanks = this.otherTanks.filter((a) => !a.isOutDate());
    }

    removeOutDatePickup() {
        if(this.trackedPickup == null)
            return false;

        if(this.trackedPickup.isOutDate())
        {
            console.log("REMOVE TRACKED PICKUPPP")
            this.trackedPickup = null;
            return true;
        }
        return false;
    }

    fetchEnvironmentData(actionType, actionParams){
        switch(actionType) {
            case OBJECTUPDATE: {
                // Case self
                if( this.name == actionParams["Name"]){
                    this.updateSelfTankData(actionParams);
                    this.removeOutDateData();

                    if(this.removeOutDatePickup())
                        this.mState = STATE_SCOUT;

                    this.perform();
                }
                else if (this.data === null){
                    break;
                }
                // Case enemy
                else if( actionParams["Type"] == "Tank"){
                    this.updateEnemyTankData(actionParams)
                    // if (this.tState == TSTATE_SEARCH) {
                        // this.tState = TSTATE_FOLLOW;
                        // var enemy = this.findTankById(actionParams["Id"]);
                        // this.turretFollowing = new Point(enemy.x, enemy.y);
                    // }

                    //shooting decision
                        var enemy = new TankData(actionParams)// this.otherTanks[i];
                        var difDegree = this.calculator.diffDegreeAbs(enemy.x, enemy.y, this.data.turretHeading);
                        var distance = this.calculator.distanceTo(enemy.x, enemy.y);
                        if(difDegree <= 10 && distance <= 60) {
                            this.socket.stopTurret();
                            this.socket.fire();
                            console.log("FIRE LA SAS")
                            break;
                        }


                }
                // Case Bonus : pickups
                else if( actionParams["Type"] == "HealthPickup") {
                    var pickup = new TankData(actionParams);

                    this.mState = STATE_GUARDIAN
                    // this.tState = TSTATE_FOLLOW;
                    this.turretFollowing = pickup;

                    // if (this.trackedPickup != null) {
                    //     var currentDis = this.calculator.distance(this.data.x, this.trackedPickup.x, this.data.y, this.trackedPickup.y);
                    //     var dis = this.calculator.distance(this.data.x, pickupX, this.data.y, pickupY);
                    //     if (dis < currentDis) {
                    //         this.trackedPickup = new TankData(actionParams);
                    //         this.trackedRect = this.calculator.squarePath(pickupX, pickupY, 30);
                    //     }
                    // } else
                    if (this.trackedPickup == null)
                    {
                        this.trackedPickup = pickup;
                        // this.trackedRect = this.calculator.squarePath(pickupX, pickupY, 30);
                        this.moveAroundRoute = this.calculator.squarePath(pickup.x,pickup.y);
                    }
                    else
                    {
                        if(this.trackedPickup.id == pickup.id)
                        {
                            this.trackedPickup.updateData(actionParams);
                        }
                        else{
                            var currentPickupDist = this.calculator.distanceTo(pickup.x, pickup.y);
                            var newPickupDist = this.calculator.distanceTo(pickup.x, pickup.y);

                            if(newPickupDist < currentPickupDist) {
                                this.trackedPickup = pickup;
                                this.moveAroundRoute = this.calculator.squarePath(pickup.x, pickup.y);
                            }
                            //     if (dis < currentDis) {
                            //         this.trackedPickup = new TankData(actionParams);
                            //         this.trackedRect = this.calculator.squarePath(pickupX, pickupY, 30);
                            //     }
                        }
                    }


                    // var below = this.data.y < this.trackedPickup["Y"];
                    // var left = this.data.x < this.trackedPickup["X"];

                    // if (below && left) {
                    //     this.rectIndex = 0;
                    // } else if (below && !left) {
                    //     this.rectIndex = 3;
                    // } else if (!below && left) {
                    //     this.rectIndex = 1;
                    // } else {
                    //     this.rectIndex = 2;
                    // }

                    // var nearestRectCorner = this.trackedRect[this.rectIndex];
                    // this.action_go_to(nearestRectCorner[0], nearestRectCorner[1]);
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
                this.mState = STATE_SCOUT;
                this.trackedPickup = null;
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
                this.killStack = 0;
                break;
            }

            case KILL: {
                this.killStack += 1;
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
               this.gameTime = actionParams["Time"];
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

    perform() {

        // if(triggered) {
        //     this.socket.fire();
            // this.socket.fire();
            // this.socket.fire();
            // console.log("FIRE");
        // }

        // console.log(Date.now()/1000);
        // this.action_go_to_nearest_bank()
        // this.moveAround();
        // this.socket.fire();
        // this.socket.moveForward(1000);
        // this.socket.toggleTurretLeft();
        // return;
        console.log("mSTATE = " + this.mState + ", tSTATE = " + this.tState);

        switch(this.mState){
            case STATE_SCOUT: {
                this.moveAroundRoute = this.calculator.coverPath();
                this.moveAround();
                this.tState = TSTATE_SEARCH;
                break;
            }

            case STATE_GUARDIAN: {
                if(this.trackedPickup == null){
                    console.log("cant get heal in STATE_GUARDIAN")
                    this.mState = STATE_SCOUT;
                    this.perform();

                    return;
                }
                this.moveAroundRoute = this.calculator.squarePath(this.trackedPickup.x, this.trackedPickup.y);
                this.moveAround();
                this.tState = TSTATE_FOLLOW;
                this.turretFollowing = this.trackedPickup;
                break;
            }

            case STATE_GET_HEAL: {
                if(this.trackedPickup == null){
                    console.log("cant get heal in STATE_GET_HEAL")
                    this.mState = STATE_SCOUT;
                    this.perform();
                    break;
                }

                this.tState = TSTATE_FOLLOW;
                this.turretFollowing = this.trackedPickup;
                this.action_go_to(this.trackedPickup.x, this.trackedPickup.y);
                break;
            }
        }

        switch(this.tState) {
            case TSTATE_SEARCH: {
                this.socket.toggleTurretLeft();
                // this.socket.turnTurretToHeading(this.data.heading + 45)
                break;
            }

            case TSTATE_FOLLOW: {
                var degree = this.calculator.degreeBetween(this.data.x, this.data.y, this.turretFollowing.x, this.turretFollowing.y)
                this.socket.turnTurretToHeading(degree);
                break;
            }
        }

        // //shooting decision
        // var triggered = false
        // for(var i = 0 ; i < this.otherTanks.length ; i++){
        //     var enemy = this.otherTanks[i];
        //     var difDegree = this.calculator.diffDegreeAbs(enemy.x, enemy.y, this.data.turretHeading);
        //     var distance = this.calculator.distanceTo(enemy.x, enemy.y);
        //     if(difDegree <= 5 && distance <= 50) {
        //         triggered = true
        //         break;
        //     }
        // }
        //
        // if(triggered) {
        //     this.socket.fire();
        //     this.socket.fire();
        //     this.socket.fire();
        //     console.log("FIRE");
        // }
    }

    // action_fire_nearest_enemy() {
    //     var nearestEnemy = this.calculator.findNearestByType("tank");
    //
    //     if(nearestEnemy == null) {
    //         return;
    //     } else {
    //         if(Math.abs(this.calculator.degreeBetween(this.mainTank.data.x,this.mainTank.data.y,nearestEnemy.x,nearestEnemy.x) - this.data.turretHeading) < 10 ){
    //             this.socket.fire()
    //         } else {
    //             this.action_look_at(nearestEnemy.x, nearestEnemy.y)
    //         }
    //
    //     }
    //
    //     this.socket.fire()
    // }

    action_go_to(x,y) {
        var myX = this.calculator.currentX();
        var myY = this.calculator.currentY();
        var distance = this.calculator.distanceTo(x, y);
        if(distance <= 3)
        {
            this.socket.stopAll();
            return;
        }

        var degree = this.calculator.degreeBetween(myX, myY, x, y);
        var difDegree = this.calculator.diffDegreeAbs(x,y, this.data.heading);

        // console.log(myX + '-' + myY);
        // console.log(difDegree);

        if(difDegree > 1)// > -0.01 && degree < 0.01)
        {
            this.socket.turnToHeading(degree);
            return
        }

        this.socket.moveForward(5);
    }

    action_go_to_left_bank(){
        this.action_go_to(0, 105)
    }

    action_go_to_right_bank(){
        this.action_go_to(0, -105)
    }

    action_go_to_nearest_bank(){
        if (this.data.y >= 0) {

            this.action_go_to_left_bank();
        } else {
            this.action_go_to_right_bank();
        }
    }

    action_pick_up_health(x,y){
        this.action_go_to(x,y)
    }

    moveAround(){
        var targetPoint = this.moveAroundRoute[this.currentCoverPoint]
        var distance = this.calculator.distance(targetPoint[0], this.data.x, targetPoint[1], this.data.y)

        // console.log(targetPoint)
        // console.log('XXXX' + distance)

        if(distance <= 3){
            this.currentCoverPoint += 1;
            this.currentCoverPoint %= this.moveAroundRoute.length
            // this.moveAround();
            return;
        }

        // this.action_go_to_nearest_bank();
        this.action_go_to(targetPoint[0], targetPoint[1])
    }

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