const { pvmsInsertData, pvmsTrackingStatus } = require("./pvms.model");
const { getJSON, checkMsgLenght } = require("./utilities/server.utilities");
const { REPLY_CODE } = require("./utilities/server.constant");

const TRACK_POINTS = process.env.PVMS_SERV_TP_LIST.split(",");

let serverState = {};
let resetAllowance = 0;

async function initListenerState(resetMode = false, allowance = 100) {
  // init serialNo
  let resp = await pvmsTrackingStatus();
  serverState["resetMode"] = resetMode;
  // serverState["serialNo"] = resp.serialNo; //TODO:
  serverState["serialNo"] = undefined;
  //TODO:
  //Confirm the first serial number after "Terminal Down"

  if (resetMode) resetAllowance = allowance;
  else resetAllowance = 0;

  // init bcSeq for each trackPoint
  for (i = 0; i < TRACK_POINTS?.length; i++) {
    let tp = TRACK_POINTS[i];
    let resp = await pvmsTrackingStatus(tp);
    serverState[tp] = resp.bcSeq;
  }

  console.log(`[INIT]\tServer State`);
  // console.log(`\t- serial :`,serverState.serialNo);
  Object.keys(serverState).map((tp) => {
    console.log(`\t- ${tp} :`, serverState[tp]);
  });
}

async function receivingData(message, useDB = true) {
  const result = {
    success: false,
    statusCode: undefined,
    repMsg: "",
  };

  const returnError = (statusCode) => {
    result.statusCode = statusCode;
    result.repMsg += String(statusCode);

    console.log(
      `[ERROR]   Code: ${statusCode}   - ${REPLY_CODE[String(statusCode)]}`
    );

    return result;
  };

  try {
    const msg = getJSON(message);
    const tp = msg.line + msg.trackPoing;

    let newSerial = serverState["serialNo"];
    let newBC = serverState[tp];

    // receive message -> destination,process,serial ...
    // reply message => process,destination,serial ...
    // processName, destinationName, serial, mode=0, length=00000, process, reply code
    const mode = "0";
    const length = "00000";
    result.repMsg = `${msg.procName}${msg.destName}${msg.serialNo}${mode}${length}${msg.type}`;

    // check message serial number
    // skip when newSerial is undefined
    if (newSerial) {
      newSerial = newSerial + 1 >= 10000 ? 1 : newSerial + 1;
      serverState["serialNo"] = newSerial;

      if (newSerial !== Number(msg.serialNo)) {
        return returnError("75");
      }
    }else {
      newSerial = Number(msg.serialNo);
      serverState["serialNo"] = Number(msg.serialNo);
    }

    // check tracking point
    if (!TRACK_POINTS.includes(tp)) {
      return returnError("13");
    }

    // check message length
    if (!checkMsgLenght(message)) {
      return returnError("76");
    }

    if (!serverState.resetMode) {
      // check bc sequence
      // skip when newBC is undefined
      if (newBC) {
        newBC = newBC + 1 >= 1000 ? 0 : newBC + 1;

        if (newBC !== Number(msg.bcSeq)) {
          return returnError("90");
        }
      }
    } else {
      resetAllowance--;
      if (resetAllowance <= 0) await initListenerState(false, 0);
    }

    // if useDB
    // insert data into database ()
    if (useDB) {
      let instRes = await pvmsInsertData(newSerial, message);
      if (!(serverState.resetMode || instRes)) {
        return returnError("14");
      }
    }

    // ## Correct Message ##
    serverState[tp] = Number(msg.bcSeq);

    // No error print success message and return result
    // log to console
    let resMsg =
      `[${serverState.resetMode ? "ALL" : "NORM"}]   Success   ` +
      `[ serial: ${String(serverState.serialNo).padStart(4, 0)} , ` +
      `TP: ${tp} , ` +
      `SEQ: ${String(serverState[tp]).padStart(3, 0)} ]`;

    console.log(resMsg);

    return {
      success: true,
      statusCode: "00",
      repMsg: result.repMsg + "00",
    };
  } catch (error) {
    return returnError("13");
  }
}

function resetSerial() {
  serverState["serialNo"] = undefined;
  return true;
}

module.exports = {
  resetSerial,
  receivingData,
  initListenerState,
};
