const { RECEIVING_CODE, REPLY_CODE } = require("./server.constant");

function checkMsgLenght(message) {
  try {
    const stdLength = Number(message.slice(17, 22));
    const dataLength = message.slice(26).length;
    return stdLength === dataLength;
  } catch (err) {
    console.log(`[ERROR] checkMsgLenght: ${err}`);
    return false;
  }
}

function getMsgType(message) {
  const typeCode = message.slice(22, 24);
  return {
    code: typeCode,
    msg: RECEIVING_CODE[typeCode],
  };
}

function getTrackPoint(message) {
  try {
    const trackPoint = message.slice(26, 29);
    return trackPoint;
  } catch (err) {
    return undefined;
  }
}

function getJSON(message) {
  try {
    const data = {
      destName: message.slice(0, 6),
      procName: message.slice(6, 12),
      serialNo: message.slice(12, 16),
      mode: message.slice(16, 17),
      length: message.slice(17, 22),
      type: message.slice(22, 24),
      result: message.slice(24, 26),
      line: message.slice(26, 27),
      trackPoint: message.slice(27, 29),
      bcSeq: message.slice(29, 32),
      bodyNo: message.slice(32, 37),
      data: message.slice(37),
    };
    return data;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

// ## PREPARE REPLY MESSAGE TEMPLATE ##
// receive message -> destination,process,serial ...
// reply message => process,destination,serial ...
// processName, destinationName, serial, mode=0, length=00000, process, reply code
function logAndReplyError(statusCode, msgJson) {
  const mode = "0";
  const length = "00000";
  const tp = msgJson.line + msgJson.trackPoint;
  const repMsg = `${msgJson.procName}${msgJson.destName}${msgJson.serialNo}${mode}${length}${msgJson.type}${statusCode}`;
  const repCode = REPLY_CODE[String(statusCode)];

  let logMsg =
    `[ERROR: ${statusCode}] [X] ${repCode.padEnd(20, " ")} < ${msgJson.type} > ` +
    `[ serial: ${msgJson.serialNo.padStart(4, 0)} , ` +
    `TP: ${tp} , ` +
    `SEQ: ${msgJson.bcSeq.padStart(3, 0)} ]`;

  console.log(logMsg);

  return {
    success: false,
    statusCode: statusCode,
    repMsg: repMsg,
  };
}

const logAndReplyOK = (msgJson) => {
  const mode = "0";
  const length = "00000";
  const tp = msgJson.line + msgJson.trackPoint;
  const repMsg = `${msgJson.procName}${msgJson.destName}${msgJson.serialNo}${mode}${length}${msgJson.type}00`;

  let logMsg =
    `[NORM : 00] [/] ${"Receive Success".padEnd(20, " ")} < ${msgJson.type} > ` +
    `[ serial: ${msgJson.serialNo.padStart(4, 0)} , ` +
    `TP: ${tp} , ` +
    `SEQ: ${msgJson.bcSeq.padStart(3, 0)} ]`;

  console.log(logMsg);

  return {
    success: true,
    statusCode: "00",
    repMsg: repMsg,
  };
};

module.exports = {
  getJSON,
  getMsgType,
  getTrackPoint,
  checkMsgLenght,
  logAndReplyOK,
  logAndReplyError,
};
