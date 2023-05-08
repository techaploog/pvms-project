const net = require("net");
require("dotenv").config();

// const { REPLY_CODE } = require("./pvms/constant/pvms.constant");

const { getMessageToSend, resetMessage } = require("./pvms/client.controller");

// * CONFIG
const MTN_SERVER_URL = process.env.PVMS_CLIENT_SRC_URL;
const HOST = process.env.PVMS_CLIENT_DESC_IP;
const PORT = Number(process.env.PVMS_CLIENT_DESC_PORT);
const DATA_FREQ = 30000;
const MAX_WAIT_COUNT = 5;

const INIT_STATE = {
  waitReplyCount : 0,
  readyToSend : true,
};

const destination = {
  host: HOST,
  port: PORT,
  localPort: Number(process.env.PVMS_CLIENT_LOCAL_PORT),
};

const clientState = {...INIT_STATE};


// * =============

const sendNotification = async (client, resend = false) => {
  clientState.readyToSend = false;

  if (clientState.waitReplyCount > MAX_WAIT_COUNT){
    console.log("[ERROR] NO response from server side.");
    console.log("   ->   Stop sending message.");
    return ;
  }else if (clientState.waitReplyCount > 0) {
    resend = true;
  }

  const msg = await getMessageToSend(resend);
  
  if (msg) {
    client.write(msg);
    clientState.waitReplyCount += 1;
    console.log(`[${resend ? "R-":"  "}SEND] >>`, msg);
  } else {
    const mtnWebUrl = MTN_SERVER_URL.match(/\d+.\d+.\d+.\d+/);
    console.log("[ERROR] Cannot create message to send.");
    console.log(`   ->   Check ALC Receiver, if it is running?`);
    console.log(`   ->   Check connection to MTN Server (${mtnWebUrl})`);
    console.log(`   ->   Check connection to WBS file.`);
  }

  clientState.readyToSend = true;
};

const client = net.connect(destination);

client.on("connect", () => {
  console.log(`Connected to ${HOST}:${PORT} ... `);
  console.log(` + START!! (send data every : ${DATA_FREQ / 1000} secondes)`);

  // INIT Sending
  resetMessage();
  clientState.waitReplyCount = 0;
  sendNotification(client);

  // Send data every 30 seconds.
  const intervalID = setInterval(()=>{
    const {readyToSend} = clientState;
    if (readyToSend){
        sendNotification(client);
    }
  },DATA_FREQ);

  // when receive reply
  client.on("data", (buffer) => {
    const replyMsg = buffer.toString("utf-8");

    // Reset clientState.waitReplyCount
    clientState.waitReplyCount = 0;

    // ! DEBUG
    console.log("REPLY :",replyMsg);

    if (replyMsg === "00") {
    }

    if (replyMsg === "R0"){
      sendNotification(client,resend=true);
    }

  });

  client.on("close", () => {
    console.log(` - Disconnected from server side.`);
    console.log(' - Re-Run this service when server side is ready.')
    resetMessage();
    clientState = {...INIT_STATE};
    clearInterval(intervalID);
  });

  client.on("error", () => {
    console.log(` - Error from server side.`);
    console.log(' - Re-Run this service when server side is ready.')
    resetMessage();
    clientState = {...INIT_STATE};
    clearInterval(intervalID);
  });
});

client.on("error", () => {
  console.log(` - Cannot connect to server.`);
  console.log(' - Re-Run this service when server side is ready.')
});
