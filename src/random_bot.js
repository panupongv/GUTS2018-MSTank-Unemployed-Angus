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

const STATE_MOVING_TO_PICKUP = 100;
const STATE_REVOLVING = 101;
const TSTATE_SEARCH = 200;
const TSTATE_FOLLOW = 201;
const TSTATE_STILL = 202;

const topBound = 70;
const bottomBound = -70;
const leftBound = -100;
const rightBound = 100;

class TankBrain {
    constructor(name, socket) {
        console.log('construst started')
        this.name = name;
        this.socket = socket;

        this.data = null;
        this.gameTime = null;
        this.snitchHolder = null;
        this.otherTanks = []

        this.mState = STATE_MOVING_TO_PICKUP;
        this.tState = TSTATE_SEARCH;

        this.going_to = false;
        this.turretFollowing = null;
        this.trackedPickup = null;
        this.trackedRect = null;
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
        this.otherTanks = this.otherTanks.filter((a) => a.isOutDate());
    }

    fetchEnvironmentData(actionType, actionParams){
        switch(actionType) {
            case OBJECTUPDATE: {
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
                    // this.perform();
                }
                // Case Bonus : pickups
                else if( actionParams["Type"] == "HealthPickup") {

                    this.tState = TSTATE_STILL;

                    if (this.trackedPickup != null) {
                        var currentDis = this.calculator.distance(this.data.x, this.trackedPickup.x, this.data.y, this.trackedPickup.y);
                        var dis = this.calculator.distance(this.data.x, actionParams["X"], this.data.y, actionParams["Y"]);
                        if (dis < currentDis) {
                            this.trackedPickup = actionParams;
                            this.trackedRect = this.calculator.getSquarePath(actionParams["X"],
                                                                             actionParams["Y"], 30);
                        }
                    } else {
                        this.trackedPickup = actionParams;
                        this.trackedRect = this.calculator.getSquarePath(actionParams["X"],
                            actionParams["Y"], 30);
                    }

                    var below = this.data.y < this.trackedPickup["Y"];
                    var left = this.data.x < this.trackedPickup["X"];

                    if (below && left) {
                        this.rectIndex = 0;
                    } else if (below && !left) {
                        this.rectIndex = 3;
                    } else if (!below && left) {
                        this.rectIndex = 1;
                    } else {
                        this.rectIndex = 2;
                    }

                    var nearestRectCorner = this.trackedRect[this.rectIndex];
                    this.action_go_to(nearestRectCorner[0], nearestRectCorner[1]);

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

    perform() {
        this.action_go_to_nearest_bank()
        return;
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


    }

    action_fire_nearest_enemy() {
        var nearestEnemy = this.calculator.findNearestByType("tank");

        if(nearestEnemy == null) {
            return;
        } else {
            if(Math.abs(this.calculator.degreeBetween(this.mainTank.data.x,this.mainTank.data.y,nearestEnemy.x,nearestEnemy.x) - this.data.turretHeading) < 10 ){
                this.socket.fire()
            } else {
                this.action_look_at(nearestEnemy.x, nearestEnemy.y)
            }
            
        }

        this.socket.fire()
    }

    action_go_to(x,y) {
        var myX = this.calculator.currentX();
        var myY = this.calculator.currentY();
        var distance = this.calculator.distance(x, myX, y, myY);
        if(distance <= 5)
        {

            this.socket.stopAll();
            if (this.mState == STATE_REVOLVING) {
                this.rectIndex++;
                this.rectIndex %= this.trackedRect.length();
                this.action_go_to(this.trackedRect[0], this.trackedRect[1]);
            }
            return;
        }

        var degree = this.calculator.degreeBetween(myX, myY, x, y);
        var difDegree = Math.abs(degree - this.data.heading);

        console.log(myX + '-' + myY);
        console.log(difDegree);

        if(difDegree > 1)// > -0.01 && degree < 0.01)
        {
            this.socket.turnToHeading(degree);
            return
        }

        this.socket.moveForward(10);
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