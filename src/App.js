SocketIOClient = require('socket.io-client')


class Sample
{
    constructor(host,port){
        console.log('Attempt to connect to http://' + host + ':' + port)
        var socket = SocketIOClient('http://' + host + ':' + port)

        socket.on('connect', function(){
            console.log('Successfully connected to http://' + host + ':' + 'port')
        });

        socket.on('disconnect', function(){
            console.log('Disconnected from http://' + host + ':' + 'port')
        });

        this.socket = socket
    }

    sendMessage(typeByte, string)
    {

        var bufArray = new ArrayBuffer(2);
        var bufView = new Uint8Array(bufArray);
        bufView[0] = 1;
        bufView[1] = "{'Name':'Hahaha'}";

        console.log(bufArray);
        console.log(bufArray.length);
        console.log();
        console.log(bufView);
        console.log(bufView.length);
        console.log();

        this.socket.emit("message",)
    }
}


var sam = new Sample('127.0.0.1','8052')
sam.sendMessage()