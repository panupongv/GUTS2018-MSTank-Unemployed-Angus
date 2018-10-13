var net = require('net');
const utf8 = require('utf8');

var client = new net.Socket();

client.connect(8052, '127.0.0.1', function() {
    console.log('Connected');
    cmd = "{'Name':'EmployedAngus'}";

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
    uia = new Uint8Array(2);
    uia[0] = 0
    uia[1] = 0
    for(var i = 0; i < 10; i++)
        console.log(client.write(uia.toString()));

    // client.write(new Buffer([1,cmd.length]))


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
