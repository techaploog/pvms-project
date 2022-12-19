const net = require('net');

require('dotenv').config();

const {extractData} = require('./data');

const destination = {
    host:process.env.PVMS_DESC_IP,
    port:process.env.PVMS_DESC_PORT,
    localPort:process.env.PVMS_LOCAL_PORT,
};
const dataInterval = 30000;

const client = net.connect(destination);

client.on('connect', () => {
    console.log(` + START!! (send data every : ${dataInterval/1000} secondes)`)

    const intervalID = setInterval(async () => {
        const data = await extractData();
        const firstRow = data[0].splice(0,2);

        // log to console
        console.log(` > Send : ${firstRow}`);

        // send data to server
        client.write(firstRow.join('-').toString());

    },dataInterval);

    client.on('close',()=>{
        console.log(` - Disconnected from server side.`);
        clearInterval(intervalID);
    })

    client.on('error',()=>{
        console.log(` - Server side connection error.`);
        clearInterval(intervalID);
    })
});

