const net = require("net");

const { receivingData } = require("./pvms.controller");

const socketServer = net.createServer((socket) => {
  const clientIP = socket.remoteAddress.split(":").slice(-1);
  const clientPORT = socket.remotePort;
  console.log(` + Connection from IP : ${clientIP} , PORT : ${clientPORT}`);

  socket.on("data", async (buffer) => {
    const receiveData = buffer.toString("utf-8");
    const resp = await receivingData(receiveData);

    // reply to sender
    socket.write(String(resp.repMsg));
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