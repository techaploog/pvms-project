const net = require("net");

const {
  receivingData,
  resetSerial,
  initListenerState,
} = require("./pvms.controller");

const socketServer = net.createServer((socket) => {
  const clientIP = socket.remoteAddress.split(":").slice(-1);
  const clientPORT = socket.remotePort;
  console.log(`\n + + Connection from IP : ${clientIP} , PORT : ${clientPORT} + +`);

  socket.on("data", async (buffer) => {
    const receiveData = buffer.toString("utf-8");
    const resp = await receivingData(receiveData);

    // reply to sender
    socket.write(String(resp.repMsg));
  });

  socket.on("end", () => {
    console.log(
      `\n - - Close Connection from IP : ${clientIP} , PORT : ${clientPORT} - -`
    );

    console.log("\n---------------");
    initListenerState();
    // resetSerial();
    // console.log(` - Reset Message Serial Number`);
  });

  socket.on("error", () => {
    console.log(
      `\n ! ! Client IP : ${clientIP} , PORT : ${clientPORT} connection error. ! !`
    );
    // resetSerial();
    // console.log(` - Reset Message Serial Number`);
    console.log("\n---------------");
    initListenerState();
  });
});

module.exports = socketServer;
