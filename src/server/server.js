const net = require('net');

require('dotenv').config();

const {startDatabaseServer,setCleaningInterval} = require('./database/db.controller'); 
const {initListenerState,} = require('./pvms.controller');

const SERVER_PORT = Number(process.env.PVMS_SERV_PORT);

const socketServer = net.createServer((socket)=>{
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

async function startPVMS (continueMode=true) {
    console.log('- - - - - - - - -')
    await startDatabaseServer();
    
    if (continueMode){
        await initListenerState();
    }

    console.log(`\n- - - - - - - - -`);
    socketServer.listen(SERVER_PORT,()=>{
        console.log(`PVMS {Socket Server} listening on PORT : ${SERVER_PORT}...`);
    });
}

startPVMS();