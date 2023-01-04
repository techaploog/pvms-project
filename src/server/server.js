const net = require("net");

require("dotenv").config();

const {
  startDatabaseServer,
  setCleaningInterval,
} = require("./database/db.controller");
const { initListenerState, receivingData } = require("./pvms.controller");

const SERVER_PORT = Number(process.env.PVMS_SERV_PORT);

const socketServer = net.createServer((socket) => {
  const clientIP = socket.remoteAddress.split(":").slice(-1);
  const clientPORT = socket.remotePort;
  console.log(` + Connection from IP : ${clientIP} , PORT : ${clientPORT}`);

  socket.on("data", async (buffer) => {
    let receiveData = buffer.toString("utf-8");
    let result = await receivingData(receiveData);
    let repMsg = receiveData.split(0, 12);

    repMsg =
      repMsg + "0" + "00000" + "00" + result.statusCode
        ? result.statusCode
        : "14";

    // reply to sender
    socket.write(repMsg);
  });

  socket.on("end", () => {
    console.log(
      ` - Close Connection from IP : ${clientIP} , PORT : ${clientPORT}`
    );
  });

  socket.on("error", () => {
    console.log(
      ` ! Client IP : ${clientIP} , PORT : ${clientPORT} connection error.`
    );
  });
});

async function startPVMS(continueMode = true) {
  console.log("- - - - - - - - -");

  await startDatabaseServer();
  await setCleaningInterval(30);

  if (continueMode) await initListenerState();

  console.log(`\n- - - - - - - - -`);
  socketServer.listen(SERVER_PORT, () => {
    console.log(`PVMS {Socket Server} listening on PORT : ${SERVER_PORT}...`);
  });

  return true;
}

startPVMS();
