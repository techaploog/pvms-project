const net = require("net");

const {
  receivingData,
  resetSerial,
} = require("./pvms.controller");

const ALLOW_DESTINATION = process.env.PVMS_SERV_DEST;

const socketServer = net.createServer((socket) => {
  const clientIP = socket.remoteAddress.split(":").slice(-1);
  const clientPORT = socket.remotePort;
  console.log(`\n + + Connection from IP : ${clientIP} , PORT : ${clientPORT} + +\n`);

  socket.on("data", async (buffer) => {
    const receiveData = buffer.toString("utf-8");

    if (receiveData.slice(0,6) === ALLOW_DESTINATION){
      const resp = await receivingData(receiveData);
      // reply to sender
      socket.write(String(resp.repMsg));
    }

  });

  socket.on("end", async () => {
    console.log(
      `\n - - Close Connection from IP : ${clientIP} , PORT : ${clientPORT} - -\n`
    );

    console.log("------------------------------");
    resetSerial();
  });

  socket.on("error", async () => {
    console.log(
      `\n ! ! Client IP : ${clientIP} , PORT : ${clientPORT} connection error. ! !\n`
    );
    console.log("------------------------------");
    resetSerial();
  });
});

module.exports = socketServer;
