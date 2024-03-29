const {
  extractTrimSeq,
  getLastInputSeq,
  extractWBS,
} = require("./client.model");

const { seqDiff, createMsgStr } = require("./utils/client.utils");

const MSG_INIT = {
  receiver: "DF0100",
  sender: "LKA010",
  serial: undefined,
  mode: "1",
  msgLength: "00140",
  procType: "92",
  procRes: "  ",
  noOfProc: "001",
  shopCode: "A_",
  lineNo: "0001",
  procName: "T002",
  msg1: Array.from({ length: 3 }, () => " ").join(""),
  ta: "00",
  msg2: Array.from({ length: 3 }, () => " ").join(""),
  wbs: "00",
  msg3: Array.from({ length: 117 }, () => " ").join(""),
};

let current_msg = { ...MSG_INIT };

async function getCalculatedTA() {
  const trackData = await getLastInputSeq();

  if (!trackData?.data) {
    return {
      success: false,
      numVeh: undefined,
    };
  }

  const scrapedData = await extractTrimSeq();

  const lastSeq = trackData ? trackData.data?.bcSeq : undefined;
  const trimSeq =
    scrapedData.length > 0 ? scrapedData[0][1].slice(2) : undefined;
  const TA = seqDiff(lastSeq, trimSeq);

  return {
    success: !isNaN(TA),
    numVeh: TA > 99 ? 99 : TA,
  };
}

async function getCalculatedWBS() {
  const wbs = await extractWBS();
  const wbsNum = Number(wbs);

  if (!isNaN(wbsNum)) {
    return {
      success: true,
      numVeh: wbsNum > 99 ? 99 : wbsNum,
    };
  }

  return {
    success: false,
    numVeh: undefined,
  };
}

function getThisSerial(currentSerial, setSerial) {
  if (setSerial) return String(setSerial).padStart(4, "0");

  if (!currentSerial) return "0000";

  const nextNum = Number(currentSerial) + 1;

  if (nextNum <= 0 || isNaN(nextNum)){
    return "0000";
  } else if (nextNum >= 10000) {
    return "0001";
  } else {
    return nextNum.toString().padStart(4, "0");
  }
}

async function getMessageToSend(resend = false) {
  if (resend) {
    return createMsgStr(current_msg);
  }

  const ta = await getCalculatedTA();
  const wbs = await getCalculatedWBS();

  if (ta?.success === false) {
    console.log("[ERROR] > Cannot retrive T-A data.");
    return undefined;
  }

  if (wbs?.success === false) {
    console.log("[ERROR] > Cannot retrive WBS data.");
    return undefined;
  }

  const {serial} = current_msg;
  
  if (!serial){
    updateSerial();
  }

  current_msg = {
    ...current_msg,
    ta: String(ta?.numVeh).padStart(2, "0"),
    wbs: String(wbs?.numVeh).padStart(2, "0"),
  };


  return createMsgStr({ ...current_msg });
}

function updateSerial (manualSerial=undefined) {
  const {serial} = current_msg;
  const thisSerial = getThisSerial(serial,manualSerial);
  current_msg = {
    ...current_msg,
    serial:thisSerial,
  };
}

function resetMessage() {
  try{
    current_msg = { ...MSG_INIT };
  } catch (err){
    console.log(err);
  }
}

module.exports = {
  updateSerial,
  resetMessage,
  getCalculatedTA,
  getCalculatedWBS,
  getMessageToSend,
};
