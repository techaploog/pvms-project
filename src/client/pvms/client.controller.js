const {
  extractTrimSeq,
  getLastInputSeq,
  extractWBS,
} = require("./client.model");

const {seqDiff,createMsgStr} = require("./utils/client.utils");

const MSG_INIT = {
  receiver: "DF0100",
  sender: "LKA010",
  serial: "0000",
  mode: "1",
  msgLength: "00140",
  procType: "92",
  procRes: " ",
  noOfProc: "001",
  shopCode: "A_",
  lineNo: "0001",
  procName: "T002",
  msg1: Array.from({ length: 3 }, () => " ").join(""),
  ta: "00",
  msg2: Array.from({ length: 3 }, () => " ").join(""),
  wbs: "00",
  msg3: Array.from({ length: 47 }, () => " ").join(""),
};

let current_msg = {...MSG_INIT};


async function getCalculatedTA() {
  const trackData = await getLastInputSeq();

  if (!trackData?.isNew) {
    return {
      success: false,
      numVeh: undefined,
    };
  }

  const scrapedData = await extractTrimSeq();

  const lastSeq = trackData ? trackData.data?.bcSeq : undefined;
  const trimSeq = scrapedData[0][1].slice(2);
  const TA = seqDiff(lastSeq, trimSeq);

  return {
    success: true,
    numVeh: TA,
  };
};

async function getCalculatedWBS() {
  const wbs = await extractWBS();

  if (wbs) {
    return {
      success: true,
      numVeh,
    };
  }

  return {
    success: false,
    numVeh: 0,
  };
};

async function getMessageToSend(resend=false) {
  if (resend){
    return createMsgStr(current_msg);
  }

  const ta = await getCalculatedTA();
  const wbs = await getCalculatedWBS();

  if (!ta || !ta?.success){
    console.log('[ERROR] > Cannot retrive T-A data.');
  }

  if (!wbs || !wbs?.success){
    console.log('[ERROR] > Cannot retrive WBS data.');
  }
  
  const {serial} = current_msg;
  const nextNum = Number(serial) + 1;
  const nextSerial = nextNum === 10000 ? "0001" : nextNum.toString().padStart(4,"0");

  current_msg = {
    ...current_msg,
    serial:nextSerial,
    ta:String(ta).padStart(2,"0"),
    wbs:String(wbs).padStart(2,"0"),
  }

  return createMsgStr(current_msg);
};

// function getData() {
//   const {serial} = current_msg;
//   const nextNum = Number(serial) + 1;
//   const nextSerial = nextNum === 10000 ? "0001" : nextNum.toString().padStart(4,"0");
  
//   current_msg.serial = nextSerial

//   return ({ ...current_msg });
// }

module.exports = {
  // getData,
  // getCalculatedTA,
  // getCalculatedWBS,
  getMessageToSend,
};
