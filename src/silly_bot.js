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

class TankBrain {
    constructor(name) {
        this.name = name;

        this.id = null;
        this.x = null;
        this.y = null;
        this.gameTime = null;
        this.snitchHolder = null;
    }

    think(actionType, actionParams) {
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
                    this.id = actionParams["Id"]
                    this.x = actionParams["X"];
                    this.y = actionParams["Y"];
                }
                // Case enemy
                else if( actionParams["Type"] == "Tank"){
                    //mmimi
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

            }
        }
    }
}

o = {Name: "Charn",
    ID:"KAK"};

inp = "{'Id': -294, 'Name': 'ManualTank', 'Type': 'Tank', 'X': 8.277814865112305, 'Y': -25.688796997070312, 'Heading': 138.75985717773438, 'TurretHeading': 138.75985717773438, 'Health': 5, 'Ammo': 10}"
inp2 = "{'Id': -342, 'Name': '', 'Type': 'HealthPickup', 'X': -24.239286422729492, 'Y': 30.22211265563965, 'Heading': 0.0, 'TurretHeading': 0.0, 'Health': 0, 'Ammo': 0}";

console.log("{'Id': -294, 'Name': 'ManualTank', 'Type': 'Tank', 'X': 8.277814865112305, 'Y': -25.688796997070312, 'Heading': 138.75985717773438, 'TurretHeading': 138.75985717773438, 'Health': 5, 'Ammo': 10}".replace(/'/g,"\""))

