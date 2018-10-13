var net = require('net');
const utf8 = require('utf8');

var client = new net.Socket();

client.connect(8052, '127.0.0.1', function() {
    console.log('Connected');
    cmd = '{"Name":"UnemployedAngus"}';

    //version 0
    // uia = new Uint8Array(2);
    // uia[0] = 1
    // uia[1] = cmd.length
    // console.log(client.write(new Buffer(uia)));
    // console.log(client.write(cmd,'utf8'));


    //version 1
    // uia = new Uint8Array(2);
    // uia[0] = 1
    // uia[1] = cmd.length
    // b1 = new Buffer(uia);
    // b2 = new Buffer(cmd, 'utf8')
    // b3 = Buffer.concat([b1,b2])
    // console.log(client.write(b3));

    //version 3
    // uia = new Uint8Array(2);
    // uia[0] = 0
    // uia[1] = 0
    // for(var i = 0; i < 10; i++)
    //     console.log(client.write(uia.toString()));

    //version 4
    // uia = new Uint8Array([1, 21, 123, 34, 78, 97, 109, 101, 34, 58, 32, 34, 82, 97, 110, 100, 111, 109, 66, 111, 116, 34, 125]);
    // console.log(client.write(uia));

    //version 5
    // uia = new Uint8Array([1, 21, 123, 34, 78, 97, 109, 101, 34, 58, 32, 34, 82, 97, 110, 100, 111, 109, 66, 111, 116, 34, 125]);
    // client.write(uia.slice(0,2));
    // client.write(uia.slice(2));

    //version 6
    uia = new Uint8Array([1, cmd.length+1]);
    client.write(uia);
    client.write(utf8.encode(cmd));

    // client.write(utf8.encode(cmd))

    // client.write(cmd);
    // client.write(new Buffer(strToUtf8Bytes(cmd)))
    // client.write('\x01\x15{"Name": "RandomBot"}')
});

client.on('data', function(data) {
    console.log('Received: ' + data);
    // client.destroy(); // kill client after server's response
});

client.on('close', function() {
    console.log('Connection closed');

});
