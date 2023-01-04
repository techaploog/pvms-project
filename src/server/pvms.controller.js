const { pvmsInsertData, pvmsTrackingStatus } = require("./pvms.model");
const {
  getTrackPoint,
  getJSON,
  checkMsgLenght,
} = require("./utilities/server.utilities");
const { REPLY_CODE } = require("./utilities/server.constant");

const TRACK_POINTS = process.env.PVMS_SERV_TP_LIST.split(",");

let serverState = {};

async function initListenerState() {
  for (i = 0; i < TRACK_POINTS?.length; i++) {
    let tp = TRACK_POINTS[i];
    let resp = await pvmsTrackingStatus(tp);
    serverState[tp] = resp;
  }

  console.log(`[INIT]\tServer State`);
  Object.keys(serverState).map((tp) => {
    console.log(`\t- ${tp} :`, serverState[tp]);
  });
}

async function receivingData(message, useDB = true) {
  const result = {
    success: false,
    statusCode: undefined,
  };

  const printError = (statusCode) => {
    result.statusCode = statusCode;
    console.log(`[ERROR]\t${statusCode}\t${REPLY_CODE[statusCode]}`);
    return result;
  };

  try {
    const msg = getJSON(message);
    const tp = msg.line + msg.trackPoing;

    // check tracking point
    if (!TRACK_POINTS.includes(tp)) {
      return printError("13");
    }

    // check message length
    if (!checkMsgLenght(message)) {
      return printError("76");
    }

    // check message serial number
    let newSerial = serverState[tp].serialNo + 1;
    newSerial = newSerial >= 10000 ? 1 : newSerial;

    if (newSerial !== Number(msg.serialNo)) {
      return printError("75");
    }

    // check bc sequence
    let newBC = serverState[tp].bcSeq + 1;
    newBC = newBC >= 1000 ? 0 : newBC;

    if (newBC !== Number(msg.bcSeq)) {
      return printError("90");
    }

    // if useDB
    // insert data into database ()
    if (useDB) {
      let instRes = await pvmsInsertData(newSerial, message);
      if (!instRes) {
        return printError("14");
      }
    }

    // update serverState
    serverState[tp] = {
      serialNo: newSerial,
      bcSeq: newBC,
    };

    // No error print success message and return result
    let resMsg =
      `[received]\tSuccess\t` +
      `serial:${String(newSerial).padStart(4, 0)} , ` +
      `SEQ:${String(newBC).padStart(3, 0)}`;

    console.log(resMsg);

    return {
      success: true,
      statusCode: "00",
    };
  } catch (error) {
    return printError("13");
  }
}

module.exports = {
  receivingData,
  initListenerState,
};
