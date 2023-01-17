const net = require("net");

const { receivingData } = require("./pvms.controller");

const socketServer = net.createServer((socket) => {
  const clientIP = socket.remoteAddress.split(":").slice(-1);
  const clientPORT = socket.remotePort;
  console.log(` + Connection from IP : ${clientIP} , PORT : ${clientPORT}`);

  socket.on("data", async (buffer) => {
    let receiveData = buffer.toString("utf-8");
    let result = await receivingData(receiveData);
    let repHeader = receiveData.split(0, 12);
    let repMsg = `${repHeader}00000000${result.statusCode ? result.statusCode : "14" }`;
    // repMsg =
    //   repMsg + "0" + "00000" + "00" + result.statusCode
    //     ? result.statusCode
    //     : "14";

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

module.exports = socketServer;