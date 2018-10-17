const Calculator = require('./calculator.js');
const TankData = require('./data.js');
const TankRemote = require('./remote.js');

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
    constructor(name, remote) {
        this.name = name;
        this.lastPerformTime = Date.now();
        this.data = null; // will be fetch later

        this.calculator = new Calculator(this);
        this.control = remote;
        this.control.setTarget(this);

        setInterval(this.thinkAndPerform.bind(this), PERFORM_RATE_INTERVAL);
    }

    updateSelfTankData(tankValues) {
        this.data = new TankData(tankValues);
    }

    notReadyToPerform() {
        return this.data === null || this.control === null;
    }

    messageIsFlooding() {
        return (Date.now() - this.lastPerformTime) < PERFORM_RATE_INTERVAL;
    }

    updateLastPerformTime() {
        this.lastPerformTime = Date.now();
    }

    memorise(dataType, values) {
        switch(dataType) {
            case OBJECTUPDATE: {
                if(values["Type"] == "Tank" && values["Name"] == this.name)
                    this.updateSelfTankData(values);
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

    thinkAndPerform() {
        if(this.notReadyToPerform())
            return;
        if(this.messageIsFlooding())
            return;
        this.updateLastPerformTime();

        /* your code now */
        // note : only 1 action should be thinkAndPerform to maintain 10 message/sec discipline
        var randomA = this.calculator.randomInt(1,4); // random [1,15]

        if(randomA == 1)
        {
            var randomB = this.calculator.randomInt(0,12);
            switch (randomB) {
                case 0: this.control.toggleForward(); break;
                case 1: this.control.toggleBackward(); break;
                case 2: this.control.toggleTurnLeft(); break;
                case 3: this.control.toggleTurnRight(); break;
                case 4: this.control.toggleTurretLeft(); break;
                case 5: this.control.toggleTurretRight(); break;
                case 6: this.control.fire(); break;
                case 7: this.control.turnBodyToHeading(0); break;
                case 8: this.control.turnTurretToHeading(90); break;
                case 9: this.control.stopAll(); break;
                case 10: this.control.stopMove(); break;
                case 11: this.control.stopTurn(); break;
                case 12: this.control.stopTurret(); break;
            }
        }
    }
}

module.exports = TankBrain;