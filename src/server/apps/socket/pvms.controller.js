const { pvmsInsertData, pvmsTrackingStatus } = require("./pvms.model");
const {
  getJSON,
  checkMsgLenght,
  logAndReplyError,
  logAndReplyOK,
} = require("./utilities/server.utilities");
const {
  SERVER_MODE,
} = require("./utilities/server.constant");

const TRACK_POINTS = process.env.PVMS_SERV_TP_LIST.split(",");

let serverState = {
  serverMode: undefined,
  serialNo: undefined,
};

// Initial Server State
async function initListenerState(mode = SERVER_MODE.STD) {
  serverState["serverMode"] = mode;

  // init bcSeq for each trackPoint
  for (i = 0; i < TRACK_POINTS?.length; i++) {
    const tp = TRACK_POINTS[i];
    const { bcSeq } = await pvmsTrackingStatus(tp);
    if (mode === SERVER_MODE.PVMS) {
      serverState[tp] = undefined;
    } else {
      serverState[tp] = bcSeq;
    }
  }

  console.log(`[INIT]\tServer State`);
  Object.keys(serverState).map((stateKey) => {
    console.log(`\t- ${stateKey} :`, serverState[stateKey]);
  });
}

async function receivingData(message) {
  const msg = getJSON(message);
  const tp = msg.line + msg.trackPoint;

  try {
    const { serialNo, serverMode } = serverState;
    const bcSeq = serverState[tp];

    const nextSerial =
      serialNo === undefined ? 0 : serialNo + 1 >= 10000 ? 1 : serialNo + 1;
    const nextBC =
      bcSeq === undefined ? undefined : bcSeq + 1 >= 1000 ? 0 : bcSeq + 1;

    const recvBC = Number(msg.bcSeq);
    const recvSR = Number(msg.serialNo);

    // ---- Check Data Correctness ----------------------
    // Incorrect "Format" of Serial No.
    if (isNaN(recvSR)) return logAndReplyError("13", msg);

    // check BF Seq Data Conversion
    // check tracking point
    if (isNaN(recvBC) || !TRACK_POINTS.includes(tp))
      return logAndReplyError("13", msg);

    // ---- Check Message Serial Number ----------------------
    if (recvSR !== 0) {
      if (recvSR === serialNo) {
        return logAndReplyOK(msg);
      }
      if (recvSR !== nextSerial && serverMode === SERVER_MODE.STD) {
        return logAndReplyError("75", msg);
      }
    }

    // ---- Check BC DATA ----------------------
    // check message length (After Check Serial Number)
    if (!checkMsgLenght(message)) return logAndReplyError("76", msg);

    // TODO: Modify this block when need to use other type of message
    // type NOT start with 0, 1 -> do nothing and reply ok.
    if (!["0", "1"].includes(msg.type[0])) {
      serverState.serialNo = recvSR;
      return logAndReplyOK(msg);
    }

    // TODO: Modify his block when need to store other message type.
    if (msg.type[0] === "0") {
      // start with 0 -> Need to validate BC Seq
      if (recvSR === 0 && recvBC === bcSeq) {
        serverState.serialNo = recvSR;
        return logAndReplyOK(msg);
      }

      if (
        recvBC !== nextBC &&
        nextBC !== undefined &&
        serverMode === SERVER_MODE.STD
      ) {
        return logAndReplyError("90", msg);
      }
      // ------ end BC Seq validation -----------

      // TODO: Update this block if need to validate data length
      // { . . . }

      // update database
      let instRes = await pvmsInsertData(recvSR, message);
      if (!instRes) {
        return logAndReplyError("14", msg);
      }

      // ## Correct Message ##
      // Update BC Seq only if process type start with 0
      serverState[tp] = recvBC;
    }

    // ## Correct Message ##
    // Store BC Seq & Serial No.
    serverState.serialNo = recvSR;

    // ---------------------------------------------
    if (serverMode === SERVER_MODE.PVMS) {
      console.log(`[  UPDATE ] MODE: ${serverMode} -> ${SERVER_MODE.STD}`);
      serverState.serverMode = SERVER_MODE.STD;
    }

    return logAndReplyOK(msg);
  } catch (error) {
    console.log(error);
    return logAndReplyError("13", msg);
  }
}

function resetSerial() {
  serverState.serialNo = undefined;

  console.log(`[INIT]\tServer State`);
  Object.keys(serverState).map((stateKey) => {
    console.log(`\t- ${stateKey} :`, serverState[stateKey]);
  });

  return true;
}

module.exports = {
  resetSerial,
  receivingData,
  initListenerState,
};
