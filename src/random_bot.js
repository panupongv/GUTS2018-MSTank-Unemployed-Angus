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

        this.snitching = false;

        this.calculator = new Calculator(this);

        this.currentStyle = 0;

        this.startTime = Date.now();

        this.startMoving = false
        console.log('construct ended')
    }

    updateSelfTankData(actionParams) {
        this.data = new TankData(actionParams)
    }

    fetchEnvironmentData(actionType, actionParams){
        switch(actionType) {
            case OBJECTUPDATE: {
                // Case self
                if( this.name == actionParams["Name"]){
                    this.updateSelfTankData(actionParams);
                    // if(this.removeOutDatePickup())
                    //     this.mState = STATE_SCOUT;

                    this.perform();
                }
                else if (this.data === null){
                    break;
                }
                // Case enemy
                else if( actionParams["Type"] == "Tank"){
                    // if (this.tState == TSTATE_SEARCH) {
                        // this.tState = TSTATE_FOLLOW;
                        // var enemy = this.findTankById(actionParams["Id"]);
                        // this.turretFollowing = new Point(enemy.x, enemy.y);
                    // }

                    //shooting decision
                        var enemy = new TankData(actionParams);// this.otherTanks[i];
                        var difDegree = this.calculator.diffDegreeAbs(enemy.x, enemy.y, this.data.turretHeading);
                        var distance = this.calculator.distanceTo(enemy.x, enemy.y);
                        if(difDegree <= 5 && distance <= 60) {
                            this.socket.fire();
                        }


                }

                break;
            } 

            case SNITCHPICKUP: {
                /*
                    Id: int
                */
                if(actionParams["Id"] == this.data.id)
                    this.snitching = true;
                break;
            }
            case DESTROYED: {
                this.startMoving = false;
                break;
            }

            case KILL: {
                this.action_go_to_nearest_bank();
                break;
            }

            case ENTEREDGOAL: {
                this.killStack = 0;
                break;
            }

        } 
    }

    perform() {
        if(Math.random() < 0.1)
            this.socket.toggleForward();
        // if(this.startMoving == false){
        //     this.startMoving = true;
        // }
        if(this.snitching)
        {
            this.action_go_to_nearest_bank();
            return;
        }
        else
        {
            var randNum = Math.floor(Math.random()*100)
            if(randNum <= 20)
            {
                var newStyle = Math.floor(Math.random()*3);
                if(newStyle != this.currentStyle)
                {
                    this.currentStyle = newStyle;
                    switch (this.currentStyle) {
                        case 0:
                            this.socket.toggleTurnLeft();
                            break;
                        case 1:
                            this.socket.toggleTurnRight();
                            break;
                        case 2:
                            this.socket.stopTurn();
                            break;
                    }
                }
            }
        }
        return;
    }

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

    moveAround(){
        var targetPoint = this.moveAroundRoute[this.currentCoverPoint]
        var distance = this.calculator.distance(targetPoint[0], this.data.x, targetPoint[1], this.data.y)

        console.log(targetPoint)
        console.log('XXXX' + distance)

        if(distance <= 2){
            this.currentCoverPoint += 1;
            this.currentCoverPoint %= this.moveAroundRoute.length
            this.moveAround();
            return;
        }

        // this.action_go_to_nearest_bank();
        this.action_go_to(targetPoint[0], targetPoint[1])
    }

    think(actionType, actionParams) {
        this.fetchEnvironmentData(actionType, actionParams);
    }
}

module.exports = TankBrain;