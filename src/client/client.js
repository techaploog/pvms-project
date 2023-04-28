const net = require("net");
require("dotenv").config();

const {getMessageToSend} = require("./pvms/client.controller");

const HOST = process.env.PVMS_CLIENT_DESC_IP;
const PORT = Number(process.env.PVMS_CLIENT_DESC_PORT);

const destination = {
  host: HOST,
  port: PORT,
  localPort: Number(process.env.PVMS_CLIENT_LOCAL_PORT),
};
const dataFrequency = 30000;


const client = net.connect(destination);
client.on("connect", () => {
  console.log(`Connected to ${HOST}:${PORT} ... `);
  console.log(
    ` + START!! (send data every : ${dataFrequency / 1000} secondes)`
  );

  const intervalID = setInterval(async () => {
    //TODO:
    const msg = await getMessageToSend();

    // ! Delete DEBUG after test
    console.log("[DEBUG] sending ...");
    console.log("[DEBUG] MSG :",msg);

    // TODO: send data to server
    // client.write(firstRow.join('-').toString());
  }, dataFrequency);

  client.on("data", (buffer) => {
    const receiveData = buffer.toString("utf-8");

    // ! Delete DEBUG after test
    console.log("[DEBUG] RECEIVE :",receiveData)
  });

  client.on("close", () => {
    console.log(` - Disconnected from server side.`);
    clearInterval(intervalID);
  });

  client.on("error", () => {
    clearInterval(intervalID);
  });
});

client.on("error", () => {
  console.log(` ! Connection error`);
});
