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

        console.log("Attempt to connect to http://" + hostname + ":" + port)
        this.client = new net.Socket();

        var ref = this
        this.client.connect(port, hostname, ()=>{
            console.log('Successfully connected to http://' + ref.hostname + ':' + ref.port);

            var cmd = '{"Name":"UnemployedAngus"}';
            var uia = new Uint8Array([1, cmd.length+1]);
            ref.client.write(uia);
            ref.client.write(utf8.encode(cmd));

             // Do some thing my nibb
        });
        // this.client.connect(port, hostname, this.testConnection);

        this.client.on('data', function(data) {
            console.log('Received: ' + data);
        });

        this.client.on('close', function() {
            console.log('Disconnected from http://' + hostname + ':' + port);

        });
    }

    toggleTurnLeft()
    {
        var uia = new Uint8Array([6, 0]);
        this.client.write(uia);
    }

    toggleTurnRight()
    {
        var uia = new Uint8Array([7, 0]);
        this.client.write(uia);
    }

    fire()
    {
        var uia = new Uint8Array([3, 0]);
        this.client.write(uia);             
    }

    moveForward(amount)
    {
        var cmd = '{ "Amount" : ' + amount + ' }';
        var uia = new Uint8Array([4, cmd.length+1]);
        this.client.write(uia);
        this.client.write(utf8.encode(cmd));
    }
}
