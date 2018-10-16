var net = require('net');
const utf8 = require('utf8');
const TankBrain = require('./random_bot.js');

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
};

class TankRemote
{
    constructor(hostname, port, tankName)
    {
        this.hostname = hostname;
        this.port = port;
        this.tankName = tankName;
        this.client = new net.Socket();
        this.tankBrain = null;

        let thisRef = this;
        console.log("Attempt to connect to http://" + hostname + ":" + port);
        this.client.connect(port, hostname, ()=>{
            console.log('Successfully connected to http://' + thisRef.hostname + ':' + thisRef.port);

            var cmd = '{"Name":"' + thisRef.tankName + '"}';
            var uia = new Uint8Array([commands.createTank, cmd.length+1]);
            thisRef.client.write(uia);
            thisRef.client.write(utf8.encode(cmd));

            this.tankBrain = new TankBrain(thisRef.tankName, thisRef);
        });

        this.client.on('data', function(data) {
            const bytes = Uint8Array.from(data);
            const rawString = data+'';
            let i = 0;

            while ( i < bytes.length )
            {
                const type = bytes[i++];
                const len = bytes[i++];
                const jsonString = rawString.slice(i,i+len);
                i += len;

                if(thisRef.tankBrain === null)
                    continue;

                if(jsonString.length <= 3)
                    continue;

                thisRef.tankBrain.think(type,JSON.parse(jsonString))
                console.log(jsonString);
            }
        });

        this.client.on('close', function() {
            console.log('Disconnected from http://' + hostname + ':' + port);
        });
    }

    createTank(socket, name){
        var cmd = '{"Name":"' + name + '"}';
        var uia = new Uint8Array([commands.createTank, cmd.length+1]);
        socket.write(uia);
        socket.write(utf8.encode(cmd));
    }

    despawnTank() {
        var uia = new Uint8Array([commands.despawnTank, 0]);
        this.client.write(packet);
    }

    fire() {
        var uia = new Uint8Array([commands.fire, 0]);
        this.client.write(uia);
    }

    toggleForward() {
        var uia = new Uint8Array([commands.toggleForward, 0]);
        this.client.write(uia);
    }

    toggleBackward() {
        var uia = new Uint8Array([commands.toggleReverse, 0]);
        this.client.write(uia);
    }

    toggleTurnLeft() {
        var uia = new Uint8Array([commands.toggleLeft, 0]);
        this.client.write(uia);
    }

    toggleTurnRight() {
        var uia = new Uint8Array([commands.toggleRight, 0]);
        this.client.write(uia);
    }

    toggleTurretLeft() {
        var uia = new Uint8Array([commands.toggleTurretLeft, 0]);
        this.client.write(uia);
    }

    toggleTurretRight() {
        var uia = new Uint8Array([commands.toggleTurretRight, 0]);
        this.client.write(uia);
    }

    turnTurretToHeading(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([commands.turnTurretToHeading, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    turnBodyToHeading(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([commands.turnToHeading, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    moveForward(amount)
    {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([commands.moveForwardDistance, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    moveBackward(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([commands.moveBackwardsDistance, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }

    stopAll() {
        var uia = new Uint8Array([commands.stopAll, 0]);
        this.client.write(uia);
    }

    stopTurn() {
        var uia = new Uint8Array([commands.stopTurn, 0]);
        this.client.write(uia);
    }

    stopMove() {
        var uia = new Uint8Array([commands.stopMove, 0]);
        this.client.write(uia);
    }

    stopTurret() {
        var uia = new Uint8Array([commands.stopTurret, 0]);
        this.client.write(uia);
    }
}

let port = 8052;
let ip = 'localhost';
let tankName ='UnemployedAngus';
new TankRemote(ip, port, tankName);