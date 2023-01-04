const net = require('net');

require('dotenv').config();

const {extractData} = require('./data');

const destination = {
    host:process.env.PVMS_DESC_IP,
    port:Number(process.env.PVMS_DESC_PORT),
    localPort:Number(process.env.PVMS_LOCAL_PORT),
};
const dataFrequency = 30000;

const client = net.connect(destination);
client.on('connect', () => {
    console.log(`Connected to PVMS server ... `)
    console.log(` + START!! (send data every : ${dataFrequency/1000} secondes)`)

    const intervalID = setInterval(async () => {
        const data = await extractData();
        const firstRow = data[0].splice(0,2);

        // log to console
        console.log(` > Send : ${firstRow}`);

        // send data to server
        client.write(firstRow.join('-').toString());

    },dataFrequency);

    client.on('close',()=>{
        console.log(` - Disconnected from server side.`);
        clearInterval(intervalID);
    })

    client.on('error',()=>{
        clearInterval(intervalID);
    })
});


client.on('error', () => {
    console.log(` ! Connection error`);
});

