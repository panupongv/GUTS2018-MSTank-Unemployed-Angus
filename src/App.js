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
        console.log("Attempt to connect to http://" + hostname + ":" + port)
        this.client = new net.Socket();
        this.client.connect(port, hostname, function()
        {
            console.log('Successfully connected to http://' + hostname + ':' + port);
        });

        this.client.on('data', function(data) {
            console.log('Received: ' + data);
        });

        this.client.on('close', function() {
            console.log('Disconnected from http://' + hostname + ':' + port);

        });
    }

    testConnection()
    {
        var uia = new Uint8Array([0, 0]);
        this.client.write(uia);
    }


}


var sam = new SocketManager('127.0.0.1',8052)
sam.testConnection()