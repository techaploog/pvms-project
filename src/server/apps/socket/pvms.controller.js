const { pvmsInsertData, pvmsTrackingStatus } = require("./pvms.model");
const { getJSON, checkMsgLenght } = require("./utilities/server.utilities");
const {
  REPLY_CODE,
  SERVER_MODE_RESET,
  SERVER_MODE_STD,
  SERVER_MODE_PVMS,
} = require("./utilities/server.constant");

const TRACK_POINTS = process.env.PVMS_SERV_TP_LIST.split(",");

let serverState = {};
let resetAllowance = 0;

async function initListenerState(mode = SERVER_MODE_STD, allowance = 50) {
  // init serialNo
  let resp = await pvmsTrackingStatus();
  serverState["mode"] = mode;
  // serverState["serialNo"] = resp.serialNo; //TODO:
  serverState["serialNo"] = undefined;
  //TODO:
  //Confirm the first serial number after "Terminal Down"

  if (mode === SERVER_MODE_RESET) resetAllowance = allowance;
  else resetAllowance = 0;

  // init bcSeq for each trackPoint
  for (i = 0; i < TRACK_POINTS?.length; i++) {
    let tp = TRACK_POINTS[i];
    let resp = await pvmsTrackingStatus(tp);
    if ([SERVER_MODE_PVMS, SERVER_MODE_RESET].includes(mode)) {
      serverState[tp] = undefined;
    } else {
      serverState[tp] = resp.bcSeq;
    }
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
    repMsg: "",
  };

  const returnError = (statusCode, serialNo, tp, seqNo) => {
    result.statusCode = statusCode;
    result.repMsg += String(statusCode);

    let errMsg =
      `[ERROR: ${statusCode}]  ${REPLY_CODE[String(statusCode)].padEnd(
        20,
        " "
      )} < X > ` +
      `[ serial: ${String(serialNo).padStart(4, 0)} , ` +
      `TP: ${tp} , ` +
      `SEQ: ${String(seqNo).padStart(3, 0)} ]`;

    console.log(errMsg);

    return result;
  };

  const msg = getJSON(message);
  const tp = msg.line + msg.trackPoint;

  try {
    let newSerial = serverState["serialNo"];
    let newBC = serverState[tp];

    let recvBC = Number(msg.bcSeq);
    let recvSR = Number(msg.serialNo);


    // receive message -> destination,process,serial ...
    // reply message => process,destination,serial ...
    // processName, destinationName, serial, mode=0, length=00000, process, reply code
    const mode = "0";
    const length = "00000";
    result.repMsg = `${msg.procName}${msg.destName}${msg.serialNo}${mode}${length}${msg.type}`;

    
    // ---- Check Serial No ----------------------
    // Incorrect Serial No.
    if (isNaN(recvSR)) {
      return returnError("13", msg.serialNo, tp, msg.bcSeq);
    }

    if (msg.serialNo !== "0000" || newSerial !== undefined) {
      // Need to Check Serial No.
      newSerial = newSerial + 1 >= 10000 ? 1 : newSerial + 1;
      if (
        newSerial !== recvSR &&
        [SERVER_MODE_STD, SERVER_MODE_PVMS].includes(serverState.mode)
      ) {
        return returnError("75", msg.serialNo, tp, msg.bcSeq);
      }
    } else {
      newSerial = 0;
    }

    // Message Serial "OK" -> Store new server state
    serverState["serialNo"] = newSerial;
    // -------------------------------------------

    // check BF Seq Data Conversion
    // check tracking point
    if (isNaN(recvBC) || !TRACK_POINTS.includes(tp)) {
      return returnError("13", msg.serialNo, tp, msg.bcSeq);
    }

    // check message length
    if (!checkMsgLenght(message)) {
      return returnError("76", msg.serialNo, tp, msg.bcSeq);
    }

    // ---- Check BC Sequence ----------------------
    if ([SERVER_MODE_STD, SERVER_MODE_PVMS].includes(serverState.mode)) {
      // check bc sequence only if type start with 0, 1
      // skip when newBC is undefined
      if (newBC && msg.type[0] === "0") {
        newBC = newBC + 1 >= 1000 ? 0 : newBC + 1;

        if (newBC !== recvBC) {
          return returnError("90", msg.serialNo, tp, msg.bcSeq);
        }

        // insert data into msg logger database ()
        // only if useDB and receiveing message is 00 (Normal Type)
        if (useDB && msg.type === "00") {
          let instRes = await pvmsInsertData(newSerial, message);
          if (!instRes) {
            return returnError("14", msg.serialNo, tp, msg.bcSeq);
          }
        }
      }
    } else if (serverState.mode === SERVER_MODE_RESET) {
      resetAllowance--;
    }

    // ## Correct Message ##
    serverState[tp] = recvBC;
    // ---------------------------------------------

    // No error print success message and return result
    // log to console
    let resMsg =
      `[${serverState.mode
        .split("_")
        .slice(-1)[0]
        .padEnd(5, " ")}: 00]  ${"Receive Success".padEnd(20, " ")} < = > ` +
      `[ serial: ${String(serverState.serialNo).padStart(4, 0)} , ` +
      `TP: ${tp} , ` +
      `SEQ: ${String(serverState[tp]).padStart(3, 0)} ]`;

    console.log(resMsg);

    if (resetAllowance <= 0 && serverState.mode === SERVER_MODE_RESET) {
      serverState.mode = SERVER_MODE_STD;
      resetSerial();
    }

    return {
      success: true,
      statusCode: "00",
      repMsg: result.repMsg + "00",
    };
  } catch (error) {
    console.log(error);
    return returnError("13");
  }
}

function resetSerial() {
  serverState["serialNo"] = undefined;

  console.log(`[INIT]\tServer State`);
  Object.keys(serverState).map((tp) => {
    console.log(`\t- ${tp} :`, serverState[tp]);
  });

  return true;
}

module.exports = {
  resetSerial,
  receivingData,
  initListenerState,
};
