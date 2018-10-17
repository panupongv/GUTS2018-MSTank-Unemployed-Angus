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
};

class TankRemote
{
    constructor(hostname, port)
    {
        this.hostname = hostname;
        this.port = port;
        this.socket = new net.Socket();
        this.tankBrain = null;
        this.onConnect = [];

        console.log("Attempt to connect to http://" + hostname + ":" + port);
        this.socket.connect(port, hostname, (()=>{
            console.log('Successfully connected to http://' + this.hostname + ':' + this.port);
            for(let i = 0 ; i < this.onConnect.length; i++)
                this.onConnect[i]();
        }).bind(this));

        this.socket.on('data', (function(data) {
            const bytes = Uint8Array.from(data);
            const rawString = data+'';
            let i = 0;

            while ( i < bytes.length )
            {
                const type = bytes[i++];
                const len = bytes[i++];
                const jsonString = rawString.slice(i,i+len);
                i += len;

                if(this.tankBrain === null)
                    continue;

                if(jsonString.length <= 3)
                    continue;

                this.tankBrain.memorise(type,JSON.parse(jsonString));
                console.log(jsonString);
            }
        }).bind(this));

        this.socket.on('close', function() {
            console.log('Disconnected from http://' + hostname + ':' + port);
        });
    }

    setTarget(brain){
        this.tankBrain = brain;
    }

    createTank(name){
        var cmd = '{"Name":"' + name + '"}';
        var uia = new Uint8Array([commands.createTank, cmd.length+1]);
        this.socket.write(uia);
        this.socket.write(utf8.encode(cmd));
    }

    despawnTank() {
        var uia = new Uint8Array([commands.despawnTank, 0]);
        this.socket.write(uia);
    }

    fire() {
        var uia = new Uint8Array([commands.fire, 0]);
        this.socket.write(uia);
    }

    toggleForward() {
        var uia = new Uint8Array([commands.toggleForward, 0]);
        this.socket.write(uia);
    }

    toggleBackward() {
        var uia = new Uint8Array([commands.toggleReverse, 0]);
        this.socket.write(uia);
    }

    toggleTurnLeft() {
        var uia = new Uint8Array([commands.toggleLeft, 0]);
        this.socket.write(uia);
    }

    toggleTurnRight() {
        var uia = new Uint8Array([commands.toggleRight, 0]);
        this.socket.write(uia);
    }

    toggleTurretLeft() {
        var uia = new Uint8Array([commands.toggleTurretLeft, 0]);
        this.socket.write(uia);
    }

    toggleTurretRight() {
        var uia = new Uint8Array([commands.toggleTurretRight, 0]);
        this.socket.write(uia);
    }

    turnTurretToHeading(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([commands.turnTurretToHeading, cmd.length+1]);
        this.socket.write(uia);
        this.socket.write(utf8.encode(cmd));
    }

    turnBodyToHeading(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([commands.turnToHeading, cmd.length+1]);
        this.socket.write(uia);
        this.socket.write(utf8.encode(cmd));
    }

    moveForward(amount)
    {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([commands.moveForwardDistance, cmd.length+1]);
        this.socket.write(uia);
        this.socket.write(utf8.encode(cmd));
    }

    moveBackward(amount) {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([commands.moveBackwardsDistance, cmd.length+1]);
        this.socket.write(uia);
        this.socket.write(utf8.encode(cmd));
    }

    stopAll() {
        var uia = new Uint8Array([commands.stopAll, 0]);
        this.socket.write(uia);
    }

    stopTurn() {
        var uia = new Uint8Array([commands.stopTurn, 0]);
        this.socket.write(uia);
    }

    stopMove() {
        var uia = new Uint8Array([commands.stopMove, 0]);
        this.socket.write(uia);
    }

    stopTurret() {
        var uia = new Uint8Array([commands.stopTurret, 0]);
        this.socket.write(uia);
    }
}

module.exports = TankRemote;