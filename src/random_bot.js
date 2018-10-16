const Calculator = require('./calculator.js');
const TankData = require('./tankdata.js');

//event types
const OBJECTUPDATE  = 18;
const HEALTHPICKUP  = 19;
const AMMOPICKUP    = 20;
const SNITCHPICKUP  = 21;
const DESTROYED     = 22;
const ENTEREDGOAL   = 23;
const KILL          = 24;
const SNITCHAPPEARED = 25;
const GAMETIMEUPDATE = 26;
const HITDETECTED   = 27;
const SUCCESSFULLHIT = 28;

const eventTypString = {
    OBJECTUPDATE    :"Object Update",
    HEALTHPICKUP    :"Health Pickup",
    AMMOPICKUP      :"Ammo Pickup",
    SNITCHPICKUP    :"Snitch Pickup",
    DESTROYED       :"Destroyed",
    ENTEREDGOAL     :"Entered Goal",
    KILL            :"Kill",
    SNITCHAPPEARED  :"Snitch Appeared",
    GAMETIMEUPDATE  :"Game Time Update",
    HITDETECTED     :"Hit Detected",
    SUCCESSFULLHIT  :"Successful Hit"
};

const PERFORM_RATE_INTERVAL = 100;

class TankBrain {
    constructor(name, socket) {
        this.name = name;
        this.motor = socket;
        this.calculator = new Calculator(this);
        this.lastPerformTime = Date.now();

        this.data = null; // will be fetch later
    }

    updateSelfTankData(tankValues) {
        this.data = new TankData(tankValues)
    }

    readyToPerform() {
        return this.data != null
    }

    messageIsFlooding() {
        return Date.now() - this.lastPerformTime < PERFORM_RATE_INTERVAL;
    }

    updateLastPerformTime() {
        this.lastPerformTime = Date.now();
    }

    fetchEnvironmentData(dataType, values){
        switch(dataType) {
            case OBJECTUPDATE: {
                if(values["Type"] == "Tank" && values["Name"] == this.name)
                    this.updateSelfTankData(values)
                break;
            } 

            case HEALTHPICKUP: {
                break;
            }

            case AMMOPICKUP: {
                break;
            }

            case SNITCHPICKUP: {
                break;
            }
            case DESTROYED: {
                break;
            }

            case ENTEREDGOAL: {
                break;
            }

            case KILL: {
                break;
            }

            case SNITCHAPPEARED: {
                break;
            }

            case GAMETIMEUPDATE: {
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
        if(this.readyToPerform())
            return;

        if(this.messageIsFlooding())
            return;

        this.updateLastPerformTime();

        /* your code now */
        // note : only 1 action should be perform to maintain 10 message/sec discipline
        var randomA = this.calculator.randomInt(1,15); // random [1,15]

        if(randomA == 1)
        {
            var randomB = this.calculator.randomInt(0,13);
            switch (randomB) {
                case 0: this.motor.toggleForward(); break;
                case 1: this.motor.toggleBackward(); break;
                case 2: this.motor.toggleTurnLeft(); break;
                case 3: this.motor.toggleTurnRight(); break;
                case 4: this.motor.toggleTurretLeft(); break;
                case 5: this.motor.toggleTurretRight(); break;
                case 6: this.motor.fire(); break;
                case 7: this.motor.turnBodyToHeading(0); break;
                case 8: this.motor.turnTurretToHeading(90); break;
                case 9: this.motor.stopAll(); break;
                case 10: this.motor.stopMove(); break;
                case 11: this.motor.stopTurn(); break;
                case 12: this.motor.stopTurret(); break;
                case 13: this.motor.despawnTank(); break;
            }
        }
    }

    think(dataType, values) {
        this.fetchEnvironmentData(dataType, values);
        this.perform();
    }
}

module.exports = TankBrain;