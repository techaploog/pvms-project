const net = require('net');

require('dotenv').config();

const SERVER_PORT = Number(process.env.PVMS_SERV_PORT);

const server = net.createServer((socket)=>{
    const clientIP = socket.remoteAddress.split(':').slice(-1);
    const clientPORT = socket.remotePort;
    console.log(` + Connection from IP : ${clientIP} , PORT : ${clientPORT}`);

    socket.on('data',(buffer)=>{
        let receiveData = buffer.toString('utf-8');
        console.log(` > Receive : ${receiveData}`);
        // TODO: put recieved data into database


        // reply to sender
        // TODO: check correctness and reply.
        let replyData = 'OK';
        socket.write(replyData);
    });

    socket.on('end',()=>{
        console.log(` - Close Connection from IP : ${clientIP} , PORT : ${clientPORT}`);
    });

    socket.on('error',()=>{
        console.log(` ! Client IP : ${clientIP} , PORT : ${clientPORT} connection error.`);
    })
});

server.listen(SERVER_PORT,()=>{
    console.log(`PVMS server start listening on PORT : ${SERVER_PORT}...`);
})