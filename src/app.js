var net = require('net');
const utf8 = require('utf8');
const TankBrain = require('./random_bot.js');

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
        this.tb = null

        console.log("Attempt to connect to http://" + hostname + ":" + port)
        this.client = new net.Socket();

        var ref = this
        this.client.connect(port, hostname, ()=>{
            console.log('Successfully connected to http://' + ref.hostname + ':' + ref.port);

            var cmd = '{"Name":"UnemployedAngus"}';
            var uia = new Uint8Array([1, cmd.length+1]);
            ref.client.write(uia);
            ref.client.write(utf8.encode(cmd));

            ref.tb = new TankBrain("UnemployedAngus", ref);
        });
        // this.client.connect(port, hostname, this.testConnection);

        this.client.on('data', function(data) {
            //version 1
            // var rawString = data+''
            // var bytes = Uint8Array.from(data)
            // var type =  parseInt(bytes[0].toString(), 16);
            // var len = parseInt(bytes[1].toString(), 16);
            // var theRest = bytes.slice(2, bytes.length)
            // var jsonString = rawString.slice(2);
            //
            // console.log(type)
            // console.log(len)
            // console.log(jsonString)

            //version 2
            // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
            var bytes = Uint8Array.from(data)
            var i = 0
            var rawString = data+'';
            // console.log(rawString)
            // console.log('-------------------------------')
            while ( i < bytes.length )
            {
                var type = bytes[i++];
                var len = bytes[i++];
                var jsonString = rawString.slice(i,i+len);
                i += len;

                //console.log(type + ' - ' + len + ' - ' + jsonString);
                if(ref.tb === null)
                    continue;
                // console.log('-' + jsonString);
                if(jsonString.length <= 3)
                    continue;
                ref.tb.think(type,JSON.parse(jsonString))
            }
            // console.log()
        });

        this.client.on('close', function() {
            console.log('Disconnected from http://' + hostname + ':' + port);

        });
    }
    // end of constructor

    despawnTank() {
        var uia = new Uint8Array([2, 0]);
        this.client.write(uia);
    }

    fire() {
        var uia = new Uint8Array([3, 0]);
        this.client.write(uia);
    }

    toggleForward() {
        var uia = new Uint8Array([4, 0]);
        this.client.write(uia);
    }

    toggleReverse() {
        var uia = new Uint8Array([5, 0]);
        this.client.write(uia);
    }

    toggleTurnLeft() {
        var uia = new Uint8Array([6, 0]);
        this.client.write(uia);
    }

    toggleTurnRight() {
        var uia = new Uint8Array([7, 0]);
        this.client.write(uia);
    }

    toggleTurretLeft() {
        var uia = new Uint8Array([8, 0]);
        this.client.write(uia);
    }

    toggleTurretRight() {
        var uia = new Uint8Array([9, 0]);
        this.client.write(uia);
    }

    turnTurretToHeading(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([10, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    turnToHeading(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([11, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    moveForward(amount)
    {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([12, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    moveBackward(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([13, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    stopAll() {
        var uia = new Uint8Array([14, 0]);
        this.client.write(uia);
    }

    stopTurn() {
        var uia = new Uint8Array([15, 0]);
        this.client.write(uia);
    }

    stopMove() {
        var uia = new Uint8Array([16, 0]);
        this.client.write(uia);
    }

    stopTurret() {
        var uia = new Uint8Array([17, 0]);
        this.client.write(uia);
    }
}

local = '127.0.0.1';
tanknet = '192.168.44.109';
var socket = new SocketManager(tanknet, 8052);